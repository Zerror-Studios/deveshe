"use client";

/**
 * Forgot password (PRD-003 FR-0.5)
 *
 * Asks for the account email and calls `customerRequestPasswordReset`. The
 * server answers the same way whether or not an account exists. Never
 * indexed.
 */
import React from "react";
import ForgotPassword from "@/components/login/ForgotPassword";

const ForgotPasswordPage = () => {
  return (
    <>
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
