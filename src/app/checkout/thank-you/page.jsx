/**
 * /checkout/thank-you (kit PRD-002 FR-3.1; was `pages/checkout/thank-you/index.jsx`).
 */

import { Suspense } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import ThankYouView from "@/views/ThankYouView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Thank You for Your Order – DeVeSheDreams",
  description:
    "Thank you for your order! Your DeVeSheDreams purchase has been successfully placed. We’ll notify you with shipping details and updates.",
  keywords: [
    "DeVeSheDreams order confirmation",
    "order received",
    "thank you for your order",
    "purchase confirmation",
    "order success"
  ],
  primaryKeywords: ["DeVeSheDreams order confirmation", "order received"],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Thank You for Your Order – DeVeSheDreams",
    description:
      "Your order has been successfully placed at DeVeSheDreams. Thank you for shopping with us! We’ll keep you updated on your order status."
  },
  twitter: {
    card: "summary_large_image",
    title: "Thank You for Your Order – DeVeSheDreams",
    description:
      "Order received! DeVeSheDreams will send you updates on your order status and shipping details."
  }
};

export const metadata = toMetadata(META, "/checkout/thank-you");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/checkout/thank-you" />
      {/* The view reads the query (useSearchParams) */}
      <Suspense fallback={null}>
        <ThankYouView />
      </Suspense>
    </>
  );
}
