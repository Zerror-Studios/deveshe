"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";
import { useQuery } from "@apollo/client/react";
import { GET_ORDER_BY_ID } from "@/graphql";
import { trackEcomEvent } from "@/utils/analytics";
import { PendingOrder } from "@/utils/pending-order.util";

// PAID is set asynchronously after verifyPayment, so poll myOrder briefly.
// After polling ends without PAID the page shows a terminal "not confirmed
// yet" state, and a missing order never shows success (RBUG-20).
const ORDER_POLL_INTERVAL_MS = 3000;
const ORDER_POLL_MAX_MS = 60 * 1000;
const REDIRECT_SECONDS = 10;
const PURCHASE_TRACKED_KEY = "ga_purchase_tracked";
const SUPPORT_EMAIL = "deveshedreams@gmail.com";

// GA purchase fires once per order, also across reloads.
const markPurchaseTracked = (orderId) => {
  try {
    const tracked = JSON.parse(localStorage.getItem(PURCHASE_TRACKED_KEY) || "[]");
    if (tracked.includes(orderId)) return false;
    localStorage.setItem(
      PURCHASE_TRACKED_KEY,
      JSON.stringify([...tracked, orderId].slice(-20))
    );
    return true;
  } catch {
    return true;
  }
};

// The order's contact for enhanced conversions; the phone and its country
// code come from the same record.
const getOrderContact = (order) => {
  const user = order?.userData;
  const address = order?.shippingAddress;
  const phoneSource = user?.phoneNumber ? user : address;
  return {
    email: user?.email || address?.email,
    phone: phoneSource?.phoneNumber || phoneSource?.phone,
    countryCode: phoneSource?.countryCode,
  };
};

const ThankYou = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [time, setTime] = useState(REDIRECT_SECONDS);
  const [isPolling, setIsPolling] = useState(true);
  const purchaseTrackedRef = useRef(false);
  const orderId = searchParams.get("orderId") || "";

  const { data: orderData, loading, error } = useQuery(GET_ORDER_BY_ID, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: "network-only",
    pollInterval: isPolling ? ORDER_POLL_INTERVAL_MS : 0,
  });
  const order = orderData?.myOrder;
  const isPaid = order?.paymentStatus === "PAID";

  useEffect(() => {
    const timer = setTimeout(() => setIsPolling(false), ORDER_POLL_MAX_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPaid || purchaseTrackedRef.current) return;
    purchaseTrackedRef.current = true;
    setIsPolling(false);
    PendingOrder.clear();
    if (!markPurchaseTracked(order._id)) return;
    // PRD-034 FR-1.3: `transaction_id` / Meta `eventID` = the order `_id`
    // (the backend's server events use it too). The contact is only hashed
    // for Google enhanced conversions (marketing consent, FR-1.6).
    trackEcomEvent.purchase(
      order._id,
      order.orderPrice ?? order.totalprice,
      order.cart || [],
      order.shippingAmount || 0,
      order.tax?.totalTax || 0,
      {
        currency: order.currency || undefined,
        customer: getOrderContact(order),
      }
    );
  }, [isPaid, order]);

  // Countdown starts once the payment is confirmed.
  useEffect(() => {
    if (!isPaid) return;
    const countdown = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [isPaid]);

  useEffect(() => {
    if (time === 0) router.push("/");
  }, [time]);

  const isMissing = !orderId || (!loading && (error || !order));
  const isUnconfirmed = !isPaid && !isPolling && !isMissing;

  if (isMissing || isUnconfirmed) {
    return (
      <>
        <div id="status_section">
          <h2>
            {isMissing ? (
              <>
                We couldn’t find <br /> this <span>order</span>
              </>
            ) : (
              <>
                Payment not <br /> <span>confirmed</span> yet
              </>
            )}
          </h2>
          <p>
            {isMissing
              ? "Check your orders in your profile, or contact us."
              : "We haven’t received confirmation from the bank yet. If money left your account, contact us with your order number before paying again."}
            {order?.orderNo ? ` Order #${order.orderNo}.` : ""}
          </p>
          <p>
            Contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <CommonButton title={"Go Back to Home"} href={"/"} />
        </div>
      </>
    );
  }

  return (
    <>
      <div id="status_section">
        {isPaid && (
          <Image
            width={1000}
            height={1000}
            src="/success.gif"
            alt="payment successfull"
          />
        )}
        <h2>
          {isPaid ? (
            <>
              Thank You <br /> for Your <span>Purchase!</span>
            </>
          ) : (
            <>
              Confirming <br /> your <span>payment</span>
            </>
          )}
        </h2>
        {isPaid ? (
          <>
            <p>
              Your payment has been successfully processed. We’re preparing your
              order{order?.orderNo ? ` #${order.orderNo}` : ""} and will send
              you updates soon. Thank you for shopping.
            </p>
            <p>
              You will be redirected to the home page in<strong> {time} </strong>
              seconds
            </p>
          </>
        ) : (
          <p>We’re confirming your payment. This can take a few seconds.</p>
        )}
        <CommonButton title={"Go Back to Home"} href={"/"} />
      </div>
    </>
  );
};

export default ThankYou;
