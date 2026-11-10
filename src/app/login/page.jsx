/**
 * /login (kit PRD-002 FR-3.1; was `pages/login/index.jsx`).
 */

import { Suspense } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import LoginView from "@/views/LoginView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Login – DeVeSheDreams",
  description:
    "Access your DeVeSheDreams account to manage orders, update your profile, and enjoy a personalized fashion experience.",
  keywords: [
    "DeVeSheDreams login",
    "account access",
    "sign in",
    "user account",
    "dashboard",
    "profile management"
  ],
  primaryKeywords: ["DeVeSheDreams login", "account access"],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Login – DeVeSheDreams",
    description:
      "Sign in to your DeVeSheDreams account to access your orders, profile, and personalized fashion recommendations."
  },
  twitter: {
    card: "summary_large_image",
    title: "Login – DeVeSheDreams",
    description:
      "Log in to your DeVeSheDreams account to manage your orders and profile details securely."
  }
};

export const metadata = toMetadata(META, "/login");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/login" />
      {/* Login and Signup read ?next= (useSearchParams) */}
      <Suspense fallback={null}>
        <LoginView />
      </Suspense>
    </>
  );
}
