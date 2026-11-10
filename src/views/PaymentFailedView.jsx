"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";
import { useCartStore } from "@/store/cart-store";
import { PendingOrder } from "@/utils/pending-order.util";

// PRD-014 FR-0.12 (UX-04): the unpaid order is kept for its bag
// (`utils/pending-order.util.js`). "Retry payment" goes back to that bag's
// checkout, which reuses the same order while the bag, email and addresses
// are unchanged; "Back to cart" opens the bag drawer.
const PaymentFailed = () => {
  const router = useRouter();
  const orderId = useSearchParams().get("orderId") || "";
  const { openCart } = useCartStore((state) => state);
  const [retryCartId, setRetryCartId] = useState(null);

  useEffect(() => {
    setRetryCartId(PendingOrder.findCartId(orderId));
  }, [orderId]);

  const handleRetry = () => {
    if (!retryCartId) return;
    router.push(`/checkout/${encodeURIComponent(retryCartId)}`);
  };

  return (
    <>
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
