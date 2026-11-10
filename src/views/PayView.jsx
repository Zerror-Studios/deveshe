"use client";

/**
 * Payment request page (PRD-028 FR-5, FR-10)
 *
 * `/pay/<token>`: the link a store sends for an order taken by phone, in
 * the studio or on WhatsApp. The server page reads
 * `getPaymentRequest(token)` with the shopper's IP
 * (`lib/page-data/pay.server.js`; the backend limits reads per IP); the
 * page is never indexed, needs no login, touches no cart and sends no
 * analytics event with the order.
 *
 * "Pay" calls `payPaymentRequest(token)` and opens the provider-neutral
 * checkout with `openPaymentCheckout`, as checkout does. A guest can't
 * call `verifyPayment`, so the payment app's answer goes to
 * `verifyPaymentRequestPayment(token, payload)` (checked with the
 * provider server to server). While that is pending, or after a return
 * from a redirect app through payment-return (`?confirm=1`, already
 * verified there), the page asks `getPaymentRequest` again until the
 * backend reads PAID. Every browser call is anonymous
 * (`skipAuth`). States come from `utils/payment-request.util.js`, which
 * reads only `extensions.code` / `reason`.
 *
 * Keep in sync with `storefronts/rare-element/src/app/pay/[token]/`.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import CommonButton from "@/components/common/CommonButton";
import {
  GET_PAYMENT_REQUEST,
  PAY_PAYMENT_REQUEST,
  VERIFY_PAYMENT_REQUEST_PAYMENT,
} from "@/graphql";
import { getErrorCode, getErrorReason } from "@/utils/api-error.util";
import { openPaymentCheckout } from "@/utils/payment-checkout.util";
import {
  PAY_CONFIRM_POLL_MS,
  PAY_CONFIRM_TIMEOUT_MS,
  PAY_VIEW_COPY,
  PayViewEnum,
  RETRYABLE_VIEWS,
  clearPayReturn,
  formatAmount,
  formatExpiry,
  savePayReturn,
  viewFromError,
  viewFromRequest,
  viewFromVerification,
} from "@/utils/payment-request.util";

// ─── Constants ────────────────────────────────────────────────────────────

const ANONYMOUS = { context: { skipAuth: true } };

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "deveshedreams@gmail.com";

const errorInfo = (error) => ({
  code: getErrorCode(error),
  reason: getErrorReason(error),
});

function sessionStore() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

// ─── Page ─────────────────────────────────────────────────────────────────

const PayPage = ({ token, request, initialView }) => {
  const client = useApolloClient();
  const [payRequest] = useMutation(PAY_PAYMENT_REQUEST, ANONYMOUS);
  const [verifyRequest] = useMutation(
    VERIFY_PAYMENT_REQUEST_PAYMENT,
    ANONYMOUS,
  );
  const [view, setView] = useState(initialView);
  const [isPaying, setIsPaying] = useState(false);
  const [isStillChecking, setIsStillChecking] = useState(false);
  const headingRef = useRef(null);
  const pollRef = useRef(null);

  const readStatus = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_PAYMENT_REQUEST,
        variables: { token },
        fetchPolicy: "network-only",
        ...ANONYMOUS,
      });
      return viewFromRequest(data?.getPaymentRequest ?? null);
    } catch (error) {
      return viewFromError(errorInfo(error));
    }
  }, [client, token]);

  // CONFIRMING: ask again until PAID (or any final state), then stop
  const confirm = useCallback(() => {
    clearTimeout(pollRef.current);
    setIsStillChecking(false);
    setView(PayViewEnum.CONFIRMING);
    const startedAt = Date.now();
    const tick = async () => {
      const next = await readStatus();
      if (
        next === PayViewEnum.READY ||
        next === PayViewEnum.RATE_LIMITED ||
        next === PayViewEnum.ERROR
      ) {
        if (Date.now() - startedAt >= PAY_CONFIRM_TIMEOUT_MS) {
          setIsStillChecking(true);
          return;
        }
        pollRef.current = setTimeout(tick, PAY_CONFIRM_POLL_MS);
        return;
      }
      if (next === PayViewEnum.PAID) clearPayReturn(sessionStore());
      setView(next);
    };
    tick();
  }, [readStatus]);

  useEffect(() => {
    if (initialView === PayViewEnum.CONFIRMING) {
      // Back from a redirect payment app: drop the address-bar flag
      window.history.replaceState(window.history.state, "", `/pay/${encodeURIComponent(token)}`);
      confirm();
    }
    return () => clearTimeout(pollRef.current);
  }, [initialView, token, confirm]);

  // Move focus to the new heading when the state changes (screen readers)
  useEffect(() => {
    if (view !== initialView) headingRef.current?.focus();
  }, [view, initialView]);

  // The provider answered: check it with the provider server to server
  // (PRD-028 FR-5.1); a pending or unreadable answer falls back to polling
  const verifyThenConfirm = useCallback(
    async (payload) => {
      setView(PayViewEnum.CONFIRMING);
      try {
        const { data } = await verifyRequest({ variables: { token, payload } });
        const next = viewFromVerification(data?.verifyPaymentRequestPayment);
        if (next !== PayViewEnum.CONFIRMING) {
          clearPayReturn(sessionStore());
          setIsPaying(false);
          setView(next);
          return;
        }
      } catch {
        // Polling below still reads the outcome from the backend
      }
      confirm();
    },
    [verifyRequest, token, confirm],
  );

  const pay = useCallback(async () => {
    setIsPaying(true);
    try {
      const { data } = await payRequest({ variables: { token } });
      savePayReturn(sessionStore(), token);
      await openPaymentCheckout(data?.payPaymentRequest, {
        onResult: (payload) => verifyThenConfirm(payload),
        onDismiss: () => {
          clearPayReturn(sessionStore());
          setIsPaying(false);
        },
      });
    } catch (error) {
      clearPayReturn(sessionStore());
      setIsPaying(false);
      setView(viewFromError(errorInfo(error)));
    }
  }, [payRequest, token, verifyThenConfirm]);

  const retry = useCallback(async () => {
    setIsPaying(false);
    setView(await readStatus());
  }, [readStatus]);

  const copy = PAY_VIEW_COPY[view] || PAY_VIEW_COPY[PayViewEnum.ERROR];
  const amountLabel = request ? formatAmount(request.amount, request.currency) : "";
  const expiry = request ? formatExpiry(request.expiresAt) : "";

  return (
    <>
      <div
        id="pay_section"
        aria-live="polite"
        aria-busy={view === PayViewEnum.CONFIRMING}
      >
        <div className="pay_card">
          {request?.storeName && <p className="pay_store">{request.storeName}</p>}
          <h1 tabIndex={-1} ref={headingRef}>
            {copy.title}
          </h1>

          {view === PayViewEnum.READY && request && (
            <>
              {request.orderNo && <p className="pay_order">Order {request.orderNo}</p>}
              <ul className="pay_lines" aria-label="Items in this order">
                {(request.lines || []).map((line, index) => (
                  <li className="pay_line" key={`${line.name}-${index}`}>
                    <span>
                      {line.name}
                      {line.variant && <span className="pay_muted"> · {line.variant}</span>}
                      <span className="pay_muted"> × {line.quantity}</span>
                    </span>
                    <span>{formatAmount(line.lineTotal, request.currency)}</span>
                  </li>
                ))}
                {request.moreLines > 0 && (
                  <li className="pay_line pay_muted">and {request.moreLines} more</li>
                )}
              </ul>
              <p className="pay_total">
                <span>Amount due</span>
                <strong>{amountLabel}</strong>
              </p>
              {request.customerNote && <p className="pay_note">{request.customerNote}</p>}
              {expiry && <p className="pay_muted">This link works until {expiry}.</p>}
              <CommonButton
                title={`Pay ${amountLabel}`}
                type="button"
                onClick={pay}
                loading={isPaying}
                testId="pay-request-pay"
              />
              <p className="pay_muted">
                Payments are processed securely by the store&apos;s payment provider.
              </p>
            </>
          )}

          {view !== PayViewEnum.READY && copy.message && <p>{copy.message}</p>}

          {view === PayViewEnum.CONFIRMING && isStillChecking && (
            <CommonButton title={"Check Again"} type="button" onClick={confirm} />
          )}

          {RETRYABLE_VIEWS.includes(view) && (
            <CommonButton title={"Try Again"} type="button" onClick={retry} />
          )}

          {view !== PayViewEnum.READY && view !== PayViewEnum.CONFIRMING && (
            <>
              <p>
                Have a question? Write to us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </p>
              <CommonButton title={"Go Back to Home"} type="button" href={"/"} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PayPage;
