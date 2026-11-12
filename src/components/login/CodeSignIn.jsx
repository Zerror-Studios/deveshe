"use client";

/**
 * Sign in with an email code (backend PRD-041 FR-9, FR-10, FR-12) on the
 * kit's `useCodeSignIn` (kit 1.1.0). It is also the sign-up: a new email
 * gets its account at the first code, and name and phone are asked later on
 * `/profile`.
 *
 * Email → Continue → "Enter the code we sent to a•••@gmail.com" (one input,
 * `autocomplete="one-time-code"`, paste and SMS/email autofill work; six
 * digits submit on their own) → signed in, the guest bag merged by the kit,
 * then the store's state follows (`completeCodeSignIn`) and the shopper goes
 * to `?next=` through `getSafeNextPath`. "Resend code" after the kit's
 * countdown (`resendIn`, 60 s or the server's `retryAfterMs`), "Use a
 * different email", and "Sign in with password instead" for customers who
 * have a password (FR-11).
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { LOGIN_CODE_LENGTH, useCodeSignIn } from "@zcom/storefront-kit/client";
import CommonButton from "../common/CommonButton";
import { useAuth } from "@/context/AuthContext";
import { getKitKeyMessage } from "@/utils/api-error.util";
import { getSafeNextPath } from "@/utils/redirect.util";

// ─── Constants ────────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CODE_MESSAGES = {
  INVALID_LOGIN_CODE:
    "That code isn't right or has expired. Check it, or request a new code.",
};

// ─── Component ────────────────────────────────────────────────────────────

const CodeSignIn = ({ onUsePassword, inactive = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeCodeSignIn } = useAuth();
  const signIn = useCodeSignIn();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const codeInputRef = useRef(null);
  const submittedCodeRef = useRef("");

  const isCodeStep = signIn.step === "code";
  const errorMessage = signIn.error
    ? getKitKeyMessage(signIn.error, CODE_MESSAGES)
    : "";

  useEffect(() => {
    if (isCodeStep) codeInputRef.current?.focus();
  }, [isCodeStep]);

  const onRequestCode = async (event) => {
    event.preventDefault();
    if (signIn.busy) return;
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setCode("");
    submittedCodeRef.current = "";
    await signIn.requestCode(value);
  };

  const verify = async (value) => {
    if (signIn.busy || isFinishing) return;
    submittedCodeRef.current = value;
    const result = await signIn.verifyCode(value);
    if (!result) return;
    setIsFinishing(true);
    try {
      const { mergeFailed } = await completeCodeSignIn(result);
      toast.success("You're signed in.");
      if (mergeFailed) {
        toast.info("Some items from your bag are no longer available.");
      }
    } catch {
      // The session is live; the profile loads again on the next page
    }
    router.replace(getSafeNextPath(searchParams.get("next"), "/"));
  };

  const onCodeChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, LOGIN_CODE_LENGTH);
    setCode(digits);
    // Six digits (typed, pasted or autofilled) submit once
    if (digits.length === LOGIN_CODE_LENGTH && submittedCodeRef.current !== digits) {
      void verify(digits);
    }
  };

  const onSubmitCode = (event) => {
    event.preventDefault();
    void verify(code);
  };

  const onResend = async () => {
    if (signIn.resendIn > 0 || signIn.busy) return;
    setCode("");
    submittedCodeRef.current = "";
    const sent = await signIn.requestCode();
    if (sent) toast.info(`We sent a new code to ${signIn.maskedEmail}.`);
  };

  const onDifferentEmail = () => {
    setCode("");
    submittedCodeRef.current = "";
    signIn.reset();
  };

  return (
    <div className="left-two" inert={inactive || undefined}>
      <div className="login-inner">
        <div className="login-t">Sign in</div>

        {!isCodeStep ? (
          <form className="login-form" onSubmit={onRequestCode} noValidate>
            <p className="login-copy">
              Enter your email and we&rsquo;ll send you a 6-digit code. New here?
              The same code creates your account.
            </p>
            <div className="inp-rel">
              <input
                className="login-inp"
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                value={email}
                aria-invalid={Boolean(emailError)}
                onChange={(event) => setEmail(event.target.value)}
              />
              {emailError && <div className="error-p">{emailError}</div>}
            </div>
            {errorMessage && (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            )}
            <CommonButton title={"Continue"} loading={signIn.busy} />
          </form>
        ) : (
          <form className="login-form" onSubmit={onSubmitCode} noValidate>
            <p className="login-copy" aria-live="polite">
              Enter the code we sent to <strong>{signIn.maskedEmail}</strong>
            </p>
            <div className="inp-rel">
              <input
                ref={codeInputRef}
                className="login-inp login-code-inp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={LOGIN_CODE_LENGTH}
                placeholder="6-digit code"
                aria-label="6-digit code"
                aria-invalid={signIn.error === "INVALID_LOGIN_CODE"}
                value={code}
                onChange={onCodeChange}
              />
            </div>
            {errorMessage && (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            )}
            <CommonButton
              title={"Sign in"}
              loading={signIn.busy || isFinishing}
              disabled={code.length !== LOGIN_CODE_LENGTH}
            />
            <div className="login-code-actions">
              <button
                type="button"
                className="login-text-btn"
                onClick={onResend}
                disabled={signIn.resendIn > 0 || signIn.busy}
              >
                {signIn.resendIn > 0
                  ? `Resend code in ${signIn.resendIn}s`
                  : "Resend code"}
              </button>
              <button
                type="button"
                className="login-text-btn"
                onClick={onDifferentEmail}
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        <div className="not-up">
          Have a password?{" "}
          <span
            role="button"
            tabIndex={0}
            onClick={onUsePassword}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onUsePassword();
            }}
          >
            Sign in with password instead
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeSignIn;
