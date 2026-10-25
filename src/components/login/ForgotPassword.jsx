/**
 * Forgot password form (PRD-003 FR-0.5)
 *
 * One email field. After the server answers, the uniform "check your
 * inbox" state is shown: the backend never reveals whether the email has
 * an account, so neither does this page.
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/forgot-password/forgot-password-client.jsx`.
 */
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import CommonButton from "../common/CommonButton";
import { CUSTOMER_REQUEST_PASSWORD_RESET } from "@/graphql";
import { getErrorMessage } from "@/utils/api-error.util";

// ─── Schema ───────────────────────────────────────────────────────────────

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ─── Component ────────────────────────────────────────────────────────────

const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const [requestReset, { loading }] = useMutation(
    CUSTOMER_REQUEST_PASSWORD_RESET,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  /* ----- Handlers ----- */
  const onSubmit = async (formData) => {
    if (loading) return;
    try {
      await requestReset({ variables: { email: formData.email.trim() } });
      setIsSent(true);
    } catch (err) {
      toast.error(
        getErrorMessage(err, "We couldn't send the link. Please try again."),
      );
    }
  };

  return (
    <div className="password-reset-cont">
      <div className="login-inner password-reset-inner" aria-live="polite">
        <div className="login-t">Forgot password</div>

        {isSent ? (
          <>
            <p className="password-reset-copy">
              If an account exists for this email, a reset link is on its way.
              It stays valid for 30 minutes. Check your spam folder too.
            </p>
            <CommonButton title={"Back to Login"} type="button" href="/login" />
          </>
        ) : (
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <p className="password-reset-copy">
              Enter your account email and we&apos;ll send you a link to set a
              new password.
            </p>
            <div className="inp-rel">
              <label className="sr-only" htmlFor="forgot-password-email">
                Email
              </label>
              <input
                id="forgot-password-email"
                className="login-inp"
                placeholder="Email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors?.email && (
                <div className="error-p">{errors?.email?.message || ""}</div>
              )}
            </div>
            <CommonButton title={"Send Reset Link"} loading={loading} />
          </form>
        )}

        <div className="not-up">
          Remembered it? <Link href="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
