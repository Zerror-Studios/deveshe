/**
 * /reset-password (kit PRD-002 FR-3.1; was `pages/reset-password.jsx`).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import ResetPasswordView from "@/views/ResetPasswordView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

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

export const metadata = toMetadata(META, "/reset-password");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/reset-password" />
      <ResetPasswordView />
    </>
  );
}
