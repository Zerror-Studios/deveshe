/**
 * Reset password (PRD-003 FR-0.5)
 *
 * Target of the link in the reset email: `/reset-password?token=…&email=…`.
 * Never indexed. The canonical is fixed: SeoHeader would otherwise build it
 * from asPath, which still carries the token on the first render.
 */
import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import ResetPassword from "@/components/login/ResetPassword";
import { Const } from "@/utils/Constant";

const META = {
  title: "Reset Password – DeVeSheDreams",
  description: "Choose a new password for your DeVeSheDreams account.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/reset-password`,
  og: {
    title: "Reset Password – DeVeSheDreams",
    description: "Choose a new password for your DeVeSheDreams account.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Password – DeVeSheDreams",
    description: "Choose a new password for your DeVeSheDreams account.",
  },
};

const ResetPasswordPage = () => {
  return (
    <>
      <SeoHeader meta={META} />
      <ResetPassword />
    </>
  );
};

export default ResetPasswordPage;
