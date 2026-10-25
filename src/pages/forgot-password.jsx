/**
 * Forgot password (PRD-003 FR-0.5)
 *
 * Asks for the account email and calls `customerRequestPasswordReset`. The
 * server answers the same way whether or not an account exists. Never
 * indexed.
 */
import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import ForgotPassword from "@/components/login/ForgotPassword";
import { Const } from "@/utils/Constant";

const META = {
  title: "Forgot Password – DeVeSheDreams",
  description: "Request a link to reset your DeVeSheDreams account password.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/forgot-password`,
  og: {
    title: "Forgot Password – DeVeSheDreams",
    description: "Request a link to reset your DeVeSheDreams account password.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password – DeVeSheDreams",
    description: "Request a link to reset your DeVeSheDreams account password.",
  },
};

const ForgotPasswordPage = () => {
  return (
    <>
      <SeoHeader meta={META} />
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
