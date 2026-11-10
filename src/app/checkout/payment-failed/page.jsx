/**
 * /checkout/payment-failed (kit PRD-002 FR-3.1; was `pages/checkout/payment-failed/index.jsx`).
 */

import { Suspense } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import PaymentFailedView from "@/views/PaymentFailedView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Payment Failed – DeVeSheDreams",
  description:
    "Unfortunately, your payment could not be processed. Please try again or contact DeVeSheDreams support for assistance.",
  keywords: [
    "DeVeSheDreams payment failed",
    "payment error",
    "transaction failed",
    "checkout issue",
    "order payment problem"
  ],
  primaryKeywords: ["DeVeSheDreams payment failed", "payment error"],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Payment Failed – DeVeSheDreams",
    description:
      "Your payment could not be processed. Please try again or reach out to DeVeSheDreams support for help with your order."
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Failed – DeVeSheDreams",
    description:
      "Payment unsuccessful! Contact DeVeSheDreams support or try again to complete your order."
  }
};

export const metadata = toMetadata(META, "/checkout/payment-failed");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/checkout/payment-failed" />
      {/* The view reads the query (useSearchParams) */}
      <Suspense fallback={null}>
        <PaymentFailedView />
      </Suspense>
    </>
  );
}
