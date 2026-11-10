"use client";

/**
 * Payment return (PRD-011 FR-4.3)
 *
 * The shopper lands here from `/api/payments/return` after a redirect or
 * form-post payment app (PayU, Cashfree redirects). `ref` names the
 * provider order; `verifyPayment` asks the provider server to server,
 * then the shopper goes to thank-you (PAID or still pending) or
 * payment-failed. Runs once per visit.
 *
 * PRD-028 FR-10.1: a shopper paying a store's payment link (`/pay/<token>`,
 * often a guest, who can't call `verifyPayment`) is verified with
 * `verifyPaymentRequestPayment(token, …)` and goes back to that page, which
 * shows the outcome (polling while the backend still waits).
 */

import React, { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import Loader from "@/components/checkout/Loader";
import { VERIFY_PAYMENT, VERIFY_PAYMENT_REQUEST_PAYMENT } from "@/graphql";
import { getErrorCode, getErrorReason } from "@/utils/api-error.util";
import { PendingOrder } from "@/utils/pending-order.util";
import {
  returnVerifyPayload,
  takePayReturn,
} from "@/utils/payment-request.util";
import {
  CheckoutStepEnum,
  trackCheckoutError,
} from "@/utils/analytics-events.util";

const PaymentReturn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApolloClient();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ref = searchParams.get("ref") || "";
    // PRD-028: a payment link's payment is verified with its token (the
    // shopper may be a guest), then the link's page shows the outcome
    const payToken = takePayReturn(window.sessionStorage);
    if (payToken) {
      const payload = returnVerifyPayload(ref);
      // A failed attempt goes back to the payable page; anything else
      // waits there for the backend's answer (`?confirm=1`)
      const back = (result) => {
        const failed = result?.data?.verifyPaymentRequestPayment?.status === "FAILED";
        const path = `/pay/${encodeURIComponent(payToken)}`;
        router.replace(failed ? path : `${path}?confirm=1`);
      };
      if (!payload) {
        back(null);
        return;
      }
      client
        .mutate({
          mutation: VERIFY_PAYMENT_REQUEST_PAYMENT,
          variables: { token: payToken, payload },
          context: { skipAuth: true },
        })
        .catch(() => null)
        .then(back);
      return;
    }
    const orderId = searchParams.get("orderId") || "";

    const goTo = (pathname, id) =>
      router.replace(id ? `${pathname}?orderId=${encodeURIComponent(id)}` : pathname);
    // PRD-013 checkout_error: `reason` is a server code, never a message.
    const failed = (reason, id) => {
      trackCheckoutError(CheckoutStepEnum.PAYMENT, reason);
      goTo("/checkout/payment-failed", id);
    };

    if (!ref) {
      failed("VERIFY_FAILED", orderId);
      return;
    }
    (async () => {
      try {
        const { data } = await client.mutate({
          mutation: VERIFY_PAYMENT,
          variables: { payload: { providerOrderId: ref } },
        });
        const result = data?.verifyPayment;
        const verifiedOrderId = result?.orderId || orderId;
        // PAID is confirmed asynchronously; the thank-you page polls myOrder.
        if (result?.success || result?.status !== "FAILED") {
          PendingOrder.clear();
          goTo("/checkout/thank-you", verifiedOrderId);
          return;
        }
        failed(result?.status || "FAILED", verifiedOrderId);
      } catch (error) {
        const reason = getErrorReason(error);
        if (reason === "ALREADY_PAID" && orderId) {
          PendingOrder.clear();
          goTo("/checkout/thank-you", orderId);
          return;
        }
        failed(reason || getErrorCode(error) || "VERIFY_FAILED", orderId);
      }
    })();
  }, [router, client, searchParams]);

  return (
    <>
      <Loader isLoading />
    </>
  );
};

export default PaymentReturn;
