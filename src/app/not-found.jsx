/**
 * 404 (was `pages/404.jsx`; PRD-014 UX-36: a way back instead of a dead end),
 * in the live site's status design (main).
 */

import React from "react";
import CommonButton from "@/components/common/CommonButton";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Page Not Found – DeVeSheDreams",
  description:
    "The page you're looking for doesn’t exist. Explore DeVeSheDreams and discover wearable art, creative fashion, and expressive capsule collections.",
  keywords: ["404", "page not found", "DeVeSheDreams error page"],
  author: "DeVeSheDreams",
  robots: "noindex, follow",
  og: {
    title: "Page Not Found – DeVeSheDreams",
    description:
      "This page does not exist. Explore DeVeSheDreams to discover artistic fashion and wearable creativity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Not Found – DeVeSheDreams",
    description: "Page not found on DeVeSheDreams.",
  },
};

export const metadata = toMetadata(META, "/404");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function NotFoundPage() {
  return (
    <div id="status_section">
      <h2>Oops! Page Not Found</h2>
      <p>
        The page you are looking for might have been removed, renamed, or is
        temporarily unavailable.
      </p>
      <CommonButton title="Go Back to Home" href="/" type="button" />
    </div>
  );
}
