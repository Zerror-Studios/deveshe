"use client";

/**
 * Reset password (PRD-003 FR-0.5)
 *
 * Target of the link in the reset email: `/reset-password?token=…&email=…`.
 * Never indexed. The canonical is fixed (`app/reset-password/page.jsx`), so
 * the token in the URL never reaches it.
 */
import React from "react";
import ResetPassword from "@/components/login/ResetPassword";

const ResetPasswordPage = () => {
  return (
    <>
      <ResetPassword />
    </>
  );
};

export default ResetPasswordPage;
