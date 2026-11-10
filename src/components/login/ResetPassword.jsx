/**
 * Reset password form (PRD-003 FR-0.5)
 *
 * Reads `token` once from the query string, removes it from the address
 * bar (a shallow `history.replaceState`), then lets the shopper choose a new
 * password. `customerResetPassword` consumes the token once; an invalid,
 * used or expired token answers `INVALID_RESET_TOKEN`, which shows the
 * "request a new link" state.
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/reset-password/reset-password-client.jsx`.
 */
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_MESSAGE,
} from "@/utils/Constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import CommonButton from "../common/CommonButton";
import { CUSTOMER_RESET_PASSWORD } from "@/graphql";
import { getErrorMessage, getErrorReason } from "@/utils/api-error.util";

// ─── Constants ────────────────────────────────────────────────────────────

const StatusEnum = {
  FORM: "FORM",
  DONE: "DONE",
  INVALID_LINK: "INVALID_LINK",
};

const PAGE_PATH = "/reset-password";

const ResetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Component ────────────────────────────────────────────────────────────

const ResetPassword = () => {
  const tokenRef = useRef(null);
  const [status, setStatus] = useState(StatusEnum.FORM);
  const [visible, setVisible] = useState(false);
  const [resetPassword, { loading }] = useMutation(CUSTOMER_RESET_PASSWORD);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
  });

  /* ----- Effects ----- */
  useEffect(() => {
    // Once per page view: read the token, then drop it from the address bar.
    if (tokenRef.current !== null) return;
    tokenRef.current =
      new URLSearchParams(window.location.search).get("token") || "";
    window.history.replaceState(null, "", PAGE_PATH);
    if (!tokenRef.current) setStatus(StatusEnum.INVALID_LINK);
  }, []);

  /* ----- Handlers ----- */
  const onSubmit = async (formData) => {
    if (loading) return;
    try {
      await resetPassword({
        variables: {
          token: tokenRef.current,
          newPassword: formData.newPassword,
        },
      });
      setStatus(StatusEnum.DONE);
    } catch (err) {
      if (getErrorReason(err) === "INVALID_RESET_TOKEN") {
        setStatus(StatusEnum.INVALID_LINK);
        return;
      }
      toast.error(
        getErrorMessage(
          err,
          "We couldn't reset your password. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="password-reset-cont">
      <div className="login-inner password-reset-inner" aria-live="polite">
        <div className="login-t">Reset password</div>

        {status === StatusEnum.DONE && (
          <>
            <p className="password-reset-copy">
              Your password has been updated and you&apos;ve been signed out
              everywhere. Log in with your new password.
            </p>
            <CommonButton title={"Go to Login"} type="button" href="/login" />
          </>
        )}

        {status === StatusEnum.INVALID_LINK && (
          <>
            <p className="password-reset-copy">
              This reset link is invalid or has expired. Links work once and
              stay valid for 30 minutes.
            </p>
            <CommonButton
              title={"Request a New Link"}
              type="button"
              href="/forgot-password"
            />
          </>
        )}

        {status === StatusEnum.FORM && (
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="pass-cont inp-rel">
              <button
                type="button"
                className="eye-cont flex-all"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </button>
              <label className="sr-only" htmlFor="reset-new-password">
                New password
              </label>
              <input
                id="reset-new-password"
                className="login-inp"
                type={visible ? "text" : "password"}
                placeholder="New password"
                autoComplete="new-password"
                {...register("newPassword")}
              />
              {errors?.newPassword && (
                <div className="error-p">
                  {errors?.newPassword?.message || ""}
                </div>
              )}
            </div>
            <div className="inp-rel">
              <label className="sr-only" htmlFor="reset-confirm-password">
                Confirm new password
              </label>
              <input
                id="reset-confirm-password"
                className="login-inp"
                type={visible ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors?.confirmPassword && (
                <div className="error-p">
                  {errors?.confirmPassword?.message || ""}
                </div>
              )}
            </div>
            <CommonButton title={"Set New Password"} loading={loading} />
          </form>
        )}

        <div className="not-up">
          <Link href="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
