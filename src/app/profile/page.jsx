/**
 * /profile (kit PRD-002 FR-3.1; was `pages/profile/index.jsx`).
 */

import { Suspense } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import ProfileView from "@/views/ProfileView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Your Account – DeVeSheDreams",
  description:
    "Access and manage your DeVeSheDreams account. View orders, update personal details, and explore your personalised fashion experience.",
  keywords: [
    "DeVeSheDreams account",
    "login",
    "user dashboard",
    "order history",
    "account settings",
    "profile management"
  ],
  primaryKeywords: ["DeVeSheDreams account", "user dashboard"],
  author: "DeVeSheDreams",
  robots: "noindex, follow",
  og: {
    title: "Your Account – DeVeSheDreams",
    description:
      "Manage your DeVeSheDreams account, track orders, and update your personal information in one secure place."
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Account – DeVeSheDreams",
    description:
      "Log in to your DeVeSheDreams account to manage your orders and profile details."
  }
};

export const metadata = toMetadata(META, "/profile");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/profile" />
      <Suspense fallback={null}>
        <ProfileView />
      </Suspense>
    </>
  );
}
