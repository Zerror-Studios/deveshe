import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";
import { useCartStore } from "@/store/cart-store";
import { PendingOrder } from "@/utils/pending-order.util";

// PRD-014 FR-0.12 (UX-04): the unpaid order is kept for its bag
// (`utils/pending-order.util.js`). "Retry payment" goes back to that bag's
// checkout, which reuses the same order while the bag, email and addresses
// are unchanged; "Back to cart" opens the bag drawer.
const PaymentFailed = ({ meta }) => {
  const router = useRouter();
  const { openCart } = useCartStore((state) => state);
  const [retryCartId, setRetryCartId] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const orderId =
      typeof router.query.orderId === "string" ? router.query.orderId : "";
    setRetryCartId(PendingOrder.findCartId(orderId));
  }, [router.isReady, router.query.orderId]);

  const handleRetry = () => {
    if (!retryCartId) return;
    router.push(`/checkout/${encodeURIComponent(retryCartId)}`);
  };

  return (
    <>
      <SeoHeader meta={meta} />

      <div id="status_section">
        <Image
          width={1000}
          height={1000}
          src="/fail.gif"
          className="fail_gif"
          alt="payment failed"
        />
        <h2>
          Payment <span>Failed</span>
        </h2>
        <p>
          Unfortunately, your payment could not be processed.
          {retryCartId
            ? " Your order is saved, so you can retry the payment."
            : " Your bag is saved, so you can check out again."}
        </p>
        {retryCartId && (
          <CommonButton
            title={"Retry payment"}
            type="button"
            onClick={handleRetry}
          />
        )}
        <CommonButton title={"Back to cart"} type="button" onClick={openCart} />
      </div>
    </>
  );
};

export default PaymentFailed;

export async function getServerSideProps() {
  const meta = {
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

  return { props: { meta } };
}
