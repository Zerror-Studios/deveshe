/**
 * /checkout/[id] (kit PRD-002 FR-3.1; was `pages/checkout/[id]/index.jsx`).
 * The bag is per customer, so nothing is read on the server; the proxy
 * asks for a session cookie and the view sends a signed-out shopper to
 * login.
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

export async function generateMetadata({ params }) {
  const { id } = await params;
  return toMetadata(META, `/checkout/${encodeURIComponent(id)}`);
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <>
      <PageSchemas meta={META} path={`/checkout/${encodeURIComponent(id)}`} />
      <CheckoutView />
    </>
  );
}
