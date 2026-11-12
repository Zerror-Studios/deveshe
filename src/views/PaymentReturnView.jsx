"use client";

/**
 * Payment return (PRD-011 FR-4.3) on the kit's `usePaymentReturn` (kit
 * PRD-002 FR-4.1).
 *
 * The shopper lands here from `/api/payments/return` after a redirect or
 * form-post payment app (PayU, Cashfree redirects). The kit verifies the
 * provider order (`ref`; PayU's own order id comes as `order`), waits for
 * the order to be PAID, and answers once per visit:
 * - an order → its order status page once PAID when the kit has its status
 *   token (backend PRD-041 FR-14; guests and signed-in shoppers), else
 *   thank-you (paid, or still confirming there), or payment-failed; the
 *   kit forgets its kept unpaid order (`PendingOrderStore`) once PAID;
 * - a store payment link (PRD-028 FR-10.1, often a guest) → back to
 *   `/pay/<token>`, which shows the outcome (`?confirm=1` unless FAILED).
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/checkout/payment-return/payment-return-client.jsx`.
 */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePaymentReturn } from "@zcom/storefront-kit/client";
import { orderStatusPath } from "@zcom/storefront-kit/core";
import Loader from "@/components/checkout/Loader";
import {
  CheckoutStepEnum,
  trackCheckoutError,
} from "@/utils/analytics-events.util";

// ─── View ─────────────────────────────────────────────────────────────────

const PaymentReturn = () => {
  const router = useRouter();
  const result = usePaymentReturn();

  useEffect(() => {
    if (!result) return;
    if (result.kind === "payment-link") {
      const path = `/pay/${encodeURIComponent(result.token)}`;
      router.replace(result.status === "FAILED" ? path : `${path}?confirm=1`);
      return;
    }
    const withOrder = (pathname) =>
      result.orderId
        ? `${pathname}?orderId=${encodeURIComponent(result.orderId)}`
        : pathname;
    // PRD-013 checkout_error: `reason` is a server code, never a message.
    if (result.status === "failed") {
      trackCheckoutError(CheckoutStepEnum.PAYMENT, "FAILED");
      router.replace(withOrder("/checkout/payment-failed"));
      return;
    }
    if (!result.orderId) {
      trackCheckoutError(CheckoutStepEnum.PAYMENT, "VERIFY_FAILED");
      router.replace("/checkout/payment-failed");
      return;
    }
    // PRD-041 FR-14: the order status page when the kit has its token (a
    // signed-in shopper's once PAID; a guest's also while confirming, since
    // thank-you reads `myOrder`, which needs a session)
    const statusPath = orderStatusPath(result.statusToken);
    if (statusPath) {
      router.replace(statusPath);
      return;
    }
    // Paid, or still confirming: the thank-you page polls the order
    router.replace(withOrder("/checkout/thank-you"));
  }, [result, router]);

  return <Loader isLoading />;
};

export default PaymentReturn;
