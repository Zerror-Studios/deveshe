/**
 * /checkout (was `/checkout/[id]` until 2026-11-12). The bag is the
 * shopper's own (the session's, or the tab's guest cart), never a URL id:
 * a cart id in the path went stale when sign-in merged the guest bag, and
 * leaked into history, referrers and analytics page paths. There is no
 * `/checkout/<id>` route any more. Nothing is read on the server. The view picks
 * the path (backend PRD-041 FR-17): the customer's checkout, the guest
 * checkout while the store's accounts are OPTIONAL, or "Sign in to check
 * out"; the proxy no longer guards `/checkout`.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import CheckoutView from "@/views/CheckoutView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Checkout – DeVeSheDreams",
  description:
    "Securely complete your purchase at DeVeSheDreams. Review your items, apply discounts, and choose your preferred payment method.",
  keywords: [
    "DeVeSheDreams checkout",
    "secure checkout",
    "shopping cart",
    "payment",
    "order review",
    "complete purchase"
  ],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Checkout – DeVeSheDreams",
    description:
      "Finalize your DeVeSheDreams order securely. Review your items, select payment options, and complete your purchase."
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout – DeVeSheDreams",
    description:
      "Securely complete your DeVeSheDreams order. Review items, choose payment method, and finish your purchase."
  }
};

export const metadata = toMetadata(META, "/checkout");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/checkout" />
      <CheckoutView />
    </>
  );
}
