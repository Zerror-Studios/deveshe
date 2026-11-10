/**
 * /checkout/payment-return (kit PRD-002 FR-3.1; was `pages/checkout/payment-return/index.jsx`).
 */

import { Suspense } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import PaymentReturnView from "@/views/PaymentReturnView";
import Loader from "@/components/checkout/Loader";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Confirming Your Payment – DeVeSheDreams",
  description: "We are confirming your payment with the payment provider.",
  robots: "noindex, nofollow",
};

export const metadata = toMetadata(META, "/checkout/payment-return");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/checkout/payment-return" />
      {/* The view reads the query (useSearchParams) */}
      <Suspense fallback={<Loader isLoading />}>
        <PaymentReturnView />
      </Suspense>
    </>
  );
}
