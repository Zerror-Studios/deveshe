/**
 * /checkout/start (kit PRD-002 FR-3.1; was `pages/checkout/start/index.jsx`).
 */

import { Suspense } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import CheckoutStartView from "@/views/CheckoutStartView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Checkout – DeVeSheDreams",
  description: "Adding your pieces to the bag and opening checkout.",
  keywords: ["DeVeSheDreams checkout"],
  primaryKeywords: ["DeVeSheDreams checkout"],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Checkout – DeVeSheDreams",
    description: "Adding your pieces to the bag and opening checkout.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout – DeVeSheDreams",
    description: "Adding your pieces to the bag and opening checkout.",
  },
};

export const metadata = toMetadata(META, "/checkout/start");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/checkout/start" />
      {/* The view reads the query (useSearchParams) */}
      <Suspense fallback={null}>
        <CheckoutStartView />
      </Suspense>
    </>
  );
}
