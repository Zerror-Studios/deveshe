/**
 * /forgot-password (kit PRD-002 FR-3.1; was `pages/forgot-password.jsx`).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import ForgotPasswordView from "@/views/ForgotPasswordView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

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

export const metadata = toMetadata(META, "/forgot-password");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/forgot-password" />
      <ForgotPasswordView />
    </>
  );
}
