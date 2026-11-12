"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { useCheckout } from "@zcom/storefront-kit/client";
import {
  GuestCheckoutStore,
  PendingOrderStore,
  orderStatusPath,
} from "@zcom/storefront-kit/core";
import CommonButton from "@/components/common/CommonButton";
import Loader from "@/components/checkout/Loader";
import { useCartStore } from "@/store/cart-store";
import { getKitKeyMessage } from "@/utils/api-error.util";
import { CHECKOUT_PATH } from "@/utils/checkout-start.util";

// PRD-014 FR-0.12 (UX-04), backend PRD-041 FR-17: the unpaid order is kept
// by the kit for this tab (`PendingOrderStore`; a guest's also with its
// `GuestCheckoutStore` token). "Retry payment" pays that order again right
// here with the kit's `retryPayment`, signed in or guest; once PAID the
// shopper goes to the order status page (else thank-you). Without a kept
// order "Back to checkout" opens `/checkout` (the bag is saved). "Back to
// cart" opens the bag drawer.

/** The kept unpaid order to retry for `orderId` (any when none is named). */
const findRetryOrderId = (orderId) => {
  const kept = [GuestCheckoutStore.get()?.orderId, PendingOrderStore.get()?.orderId];
  return kept.find((id) => id && (!orderId || id === orderId)) || null;
};

const PaymentFailed = () => {
  const router = useRouter();
  const orderId = useSearchParams().get("orderId") || "";
  const { openCart } = useCartStore((state) => state);
  const checkout = useCheckout();
  const [retryOrderId, setRetryOrderId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setRetryOrderId(findRetryOrderId(orderId));
    setIsReady(true);
  }, [orderId]);

  const handleRetry = async () => {
    if (!retryOrderId || checkout.isBusy) return;
    setRetryError("");
    const result = await checkout.retryPayment(retryOrderId);
    if (result.step === "paid" || result.step === "unconfirmed") {
      const path = orderStatusPath(
        result.statusToken ?? GuestCheckoutStore.get()?.statusToken,
      );
      setIsLeaving(true);
      router.replace(
        path || `/checkout/thank-you?orderId=${encodeURIComponent(retryOrderId)}`,
      );
      return;
    }
    if (result.step === "redirecting") {
      setIsLeaving(true);
      return;
    }
    if (result.step === "dismissed") {
      toast.info("Payment was not completed. You can try again.");
      return;
    }
    if (result.step === "failed") {
      setRetryError(getKitKeyMessage(result.reason));
      // The kit forgets an order that can't be paid any more
      setRetryOrderId(findRetryOrderId(orderId));
    }
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
          {retryOrderId
            ? " Your order is saved, so you can retry the payment."
            : " Your bag is saved, so you can check out again."}
        </p>
        {retryError && (
          <p className="checkout_submit_error" role="alert">
            {retryError}
          </p>
        )}
        {retryOrderId ? (
          <CommonButton
            title={"Retry payment"}
            type="button"
            loading={checkout.isBusy || isLeaving}
            onClick={handleRetry}
          />
        ) : (
          isReady && (
            <CommonButton
              title={"Back to checkout"}
              type="button"
              onClick={() => router.push(CHECKOUT_PATH)}
            />
          )
        )}
        <CommonButton title={"Back to cart"} type="button" onClick={openCart} />
      </div>
      <Loader isLoading={checkout.step === "verifying" || isLeaving} />
    </>
  );
};

export default PaymentFailed;
