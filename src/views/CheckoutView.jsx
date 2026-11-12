"use client";

/**
 * The checkout page (`/checkout`): the signed-in customer's checkout, the
 * guest checkout or the sign-in prompt (backend PRD-041 FR-17).
 *
 * Both checkouts run on the kit's `useCheckout()` (kit 1.1.0): a signed-in
 * customer here with `start` → `pay`, a signed-out shopper in
 * `components/checkout/GuestCheckout.jsx` with `startGuest` → `pay`. The
 * kit opens the checkout session and waits for RESERVED, completes it
 * (a ₹0 order is placed PAID, COM-08), opens the store's payment app
 * (`launchPayment`; Nimbbl through the `nimbbl_sonic` registered in
 * `components/layouts/Providers.jsx`), verifies and waits for PAID. It
 * keeps the unpaid order for a retry (`PendingOrderStore`, this tab) and
 * sends the checkout's GA4 events and the paid order's ads purchase itself.
 *
 * One flow on both paths (owner, 2026-11-12):
 * - "Continue to payment" validates the form and opens the session
 *   (`start` here, `startGuest` for a guest), waits for RESERVED and shows
 *   the server's final total. A session takes a 15-minute stock hold
 *   (PRD-014 W0V-C-03, W0V2-02), so it opens only on this explicit action,
 *   never on page load, a preselected address or typing.
 * - "Pay now" is enabled only while the session is reserved for exactly
 *   the bag, coupon and details on screen (`isReservedFor`); otherwise it
 *   is disabled with "Continue to payment to see your final total". Any
 *   change to the bag, coupon, email, addresses or the news box needs
 *   "Continue to payment" again; the backend then replaces the session.
 * - A closed payment window: a toast and "Pay again" (`retryPayment`).
 *   The kit sends GA4's `checkout_error` (`PAYMENT_DISMISSED`) itself.
 *
 * Signed in (saved addresses):
 * - A kept unpaid order (a dismissed or failed payment, also after a
 *   reload) is paid again while the bag and details match: its saved
 *   address is preselected and its pricing shown, and "Continue to
 *   payment" reuses it (the kit's `start` finds it); changed details place
 *   a new order (the backend cancels the old one, PRD-015 FR-14).
 * - Once PAID: the order status page (`orderStatusPath`, FR-14), else
 *   `/checkout/thank-you?orderId=…`. A failed payment of a placed order:
 *   `/checkout/payment-failed?orderId=…` ("Retry payment"). A refusal that
 *   needs the bag or the address reviewed stays here with its message;
 *   `SHIPPING_UNAVAILABLE` scrolls to the delivery address.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApolloClient, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCheckout,
  useSession,
  useStoreCheckoutOptions,
} from "@zcom/storefront-kit/client";
import {
  PendingOrderStore,
  checkoutFingerprint,
  orderStatusPath,
} from "@zcom/storefront-kit/core";
import { CART_LIST, UPDATE_MY_PROFILE } from "@/graphql";
import { CheckoutSchema } from "@/validations/CheckoutValidation";
import Heading from "@/components/checkout/Heading";
import ContactDetail from "@/components/checkout/ContactDetail";
import Delivery from "@/components/checkout/Delivery";
import Shipping from "@/components/checkout/Shipping";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummary from "@/components/checkout/OrderSummery";
import GuestCheckout from "@/components/checkout/GuestCheckout";
import { useCheckoutShippingEstimate } from "@/hooks/useCheckoutShippingEstimate";
import Loader from "@/components/checkout/Loader";
import CommonButton from "@/components/common/CommonButton";
import { useAuthStore } from "@/store/auth-store";
import { EmailSubscribedStatus } from "@/utils/Constant";
import { useAdsBeginCheckout } from "@/hooks/useAdsBeginCheckout";
import { useDroppedCouponCheck } from "@/hooks/useDroppedCouponCheck";
import { isSignInRequiredReason } from "@/utils/coupon.util";
import { getKitKeyMessage } from "@/utils/api-error.util";
import { getLoginPath } from "@/utils/redirect.util";
import { CHECKOUT_PATH } from "@/utils/checkout-start.util";
import {
  getCartFingerprint,
  getDetailsKey,
  isKeptOrderStale,
  isReservedFor,
  toCustomerCheckoutInput,
} from "@/utils/checkout-kit.util";

// ─── Constants ────────────────────────────────────────────────────────────

/** Answers after which the bag on screen is stale (refetched). */
const CART_REFRESH_KEYS = [
  "PRICE_CHANGED",
  "PROMOTION_INVALID",
  "OUT_OF_STOCK",
  "INSUFFICIENT_STOCK",
  "INVALID_ITEMS",
  "EMPTY_CART",
];
/** Answers that belong to the delivery address. */
const ADDRESS_KEYS = ["SHIPPING_UNAVAILABLE", "ADDRESS_REQUIRED"];
/** Failures with no placed order to retry (stay on this page). */
const NO_RETRY_KEYS = [
  "ORDER_CANCELLED",
  "ORDER_NOT_FOUND",
  "ORDER_NOT_PAYABLE",
  "NOT_FOUND",
];
/** The order (or its stock hold) is gone: the next attempt starts over. */
const START_OVER_KEYS = [
  "PRICE_CHANGED",
  "CHECKOUT_EXPIRED",
  "RESERVATION_RELEASED",
  "ORDER_CANCELLED",
];
/** Messages the shopper reads beside the button, not as a toast. */
const IN_PLACE_KEYS = [...CART_REFRESH_KEYS, ...ADDRESS_KEYS];

// CustomerProfile.emailSubscribedStatus is numeric on the backend
const EMAIL_SUBSCRIBED_STATUS_CODE = {
  [EmailSubscribedStatus.UNSUBSCRIBED]: 0,
  [EmailSubscribedStatus.SUBSCRIBED]: 1,
  [EmailSubscribedStatus.NEVER_SUBSCRIBED]: 2,
};

const BAG_LOADING_MESSAGE =
  "Your bag is still loading. Please try again in a moment.";
const BAG_FAILED_MESSAGE = "We could not load your bag. Please refresh the page.";
const CONTINUE_HINT = "Continue to payment to see your final total.";

// ─── Helpers ──────────────────────────────────────────────────────────────

const scrollTo = (selector) =>
  document
    .querySelector(selector)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

const isPromotionKey = (key) => String(key || "").startsWith("PROMOTION_");

/** The bag must be reviewed: stay here, never the payment-failed page. */
const needsBagReview = (key) =>
  CART_REFRESH_KEYS.includes(key) || isPromotionKey(key);

/** The kit's kept unpaid order, dropped when expired (`find` checks it). */
const readKeptOrder = () => {
  const kept = PendingOrderStore.get();
  return kept?.fingerprint ? PendingOrderStore.find(kept.fingerprint) : null;
};

// ─── Signed-in checkout ───────────────────────────────────────────────────

const CustomerCheckout = () => {
  const router = useRouter();
  const client = useApolloClient();
  const checkout = useCheckout();
  const { isLoggedIn, user, setUser } = useAuthStore((state) => state);
  const [isReady, setIsReady] = useState(false);
  // The details key "Continue to payment" reserved; null until then
  const [reservedKey, setReservedKey] = useState(null);
  // PRD-014 UX-02: a step that fails says so at the button
  const [submitError, setSubmitErrorText] = useState("");
  // The kit key behind `submitError` (a "Sign in" link for its answer)
  const [submitErrorKey, setSubmitErrorKey] = useState(null);
  const setSubmitError = (message, key = null) => {
    setSubmitErrorText(message);
    setSubmitErrorKey(key);
  };
  // True once the browser is leaving (status page, payment page)
  const [isLeaving, setIsLeaving] = useState(false);
  // Bumped to re-read the kit's kept order after we change it
  const [keptVersion, setKeptVersion] = useState(0);
  // Which step a kit failure belongs to: "start" or "pay"
  const phaseRef = useRef(null);
  const payingRef = useRef(false);
  const cartFingerprintRef = useRef(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  // The customer's own bag (the owner comes from the session; no URL id,
  // which went stale when sign-in merged the guest bag)
  const {
    data: response,
    loading,
    refetch,
  } = useQuery(CART_LIST, {
    skip: !isLoggedIn,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });
  const cartData = response?.getCart || {};

  // The ads networks' begin checkout, once per page load (both paths);
  // the kit sends GA4's `begin_checkout` once reserved
  useAdsBeginCheckout(cartData);
  // A bag code the server dropped at "Continue to payment"
  const droppedCoupon = useDroppedCouponCheck(cartData, refetch);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CheckoutSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      shippingAddress: {
        addressType: "HOME",
        countryCode: "+91",
        country: "India",
        primary: true,
      },
      billingAddress: {
        addressType: "HOME",
        countryCode: "+91",
        country: "India",
        primary: false,
      },
      // PRD-014 FR-2.8 (UX-29): marketing email is opt-in, never pre-ticked;
      // the box shows the profile's own choice once it loads.
      emailSubscribedStatus: EmailSubscribedStatus.UNSUBSCRIBED,
      useShippingAsBilling: true,
    },
  });

  // The profile loads after a page reload (FE-12: it isn't persisted), so
  // fill the email once it arrives, without overwriting a typed one.
  useEffect(() => {
    if (isLoggedIn && user?.email && !watch("email")) {
      setValue("email", user.email);
    }
  }, [isLoggedIn, user?.email]);

  useEffect(() => {
    if (!isLoggedIn || user?.emailSubscribedStatus === undefined) return;
    setValue(
      "emailSubscribedStatus",
      user.emailSubscribedStatus ===
        EMAIL_SUBSCRIBED_STATUS_CODE[EmailSubscribedStatus.SUBSCRIBED]
        ? EmailSubscribedStatus.SUBSCRIBED
        : EmailSubscribedStatus.UNSUBSCRIBED,
    );
  }, [isLoggedIn, user?.emailSubscribedStatus]);

  // ─── Details, confirmation and the kept order ───────────────────────────

  const [
    watchedEmail,
    watchedShipping,
    watchedBilling,
    watchedUseShippingAsBilling,
    watchedEmailStatus,
  ] = useWatch({
    control,
    name: [
      "email",
      "shippingAddress",
      "billingAddress",
      "useShippingAsBilling",
      "emailSubscribedStatus",
    ],
  });
  const cartFingerprint = cartData?._id ? getCartFingerprint(cartData) : null;
  // Shipping for the address entered, before "Continue to payment"
  const { estimate: shippingEstimate, estimating: isEstimatingShipping } =
    useCheckoutShippingEstimate(watchedShipping, cartFingerprint);
  // Built from the raw form values (the parsed ones drop a saved
  // address's flat), exactly as `start` receives them
  const inputOf = (values) => toCustomerCheckoutInput(cartData, values);
  // The news box is part of the details: a change needs Continue again
  const keyOf = (input, emailStatus, fingerprint = cartFingerprint) =>
    getDetailsKey(fingerprint, [input, emailStatus ?? null]);
  const detailsInput = inputOf({
    email: watchedEmail,
    shippingAddress: watchedShipping,
    billingAddress: watchedBilling,
    useShippingAsBilling: watchedUseShippingAsBilling,
  });
  const detailsKey = keyOf(detailsInput, watchedEmailStatus);

  const isBusy = checkout.isBusy || isLeaving;
  const isReserved = isReservedFor({
    hasSession: Boolean(checkout.session),
    step: checkout.step,
    reservedKey,
    detailsKey,
  });
  // A dismissed payment window: pay the same order again
  const canPayAgain =
    isReserved && checkout.step === "dismissed" && Boolean(checkout.orderId);

  // The kit's kept unpaid order of this bag (read after mount: storage)
  const keptOrder = useMemo(
    () => (isReady ? readKeptOrder() : null),
    [isReady, keptVersion, checkout.step],
  );
  const hasPendingOrder =
    Boolean(keptOrder && cartData?._id) && !isKeptOrderStale(keptOrder, cartData);
  const isPendingOrderDetails =
    hasPendingOrder && keptOrder.fingerprint === checkoutFingerprint(detailsInput);

  const forgetKeptOrder = () => {
    PendingOrderStore.clear();
    setKeptVersion((version) => version + 1);
  };

  // A changed bag or coupon: the confirmed total and the kept order no
  // longer match it (the kit's fingerprint has the lines, not the coupon),
  // so both are dropped; on load, a kept order of another bag or coupon too
  useEffect(() => {
    if (!cartFingerprint) return;
    const previous = cartFingerprintRef.current;
    cartFingerprintRef.current = cartFingerprint;
    if (previous && previous !== cartFingerprint) {
      // The server's own drop of a code that no longer applies keeps the
      // session (its total is the one shown)
      if (droppedCoupon.isExpectedChange(cartFingerprint)) return;
      droppedCoupon.clear();
      setReservedKey(null);
      forgetKeptOrder();
      return;
    }
    if (isKeptOrderStale(readKeptOrder(), cartData)) forgetKeptOrder();
  }, [cartFingerprint, isReady]);

  // FR-0.12: on a retry the saved address of the kept order is preselected
  // (not the primary one), so paying again reuses that order.
  const isPendingAddress = useCallback(
    (formAddress) => {
      if (!hasPendingOrder || !keptOrder) return false;
      const input = inputOf({
        email: watchedEmail,
        shippingAddress: formAddress,
        useShippingAsBilling: true,
      });
      return keptOrder.fingerprint === checkoutFingerprint(input);
    },
    [hasPendingOrder, keptOrder, watchedEmail, cartFingerprint],
  );

  // The server pricing on screen: the reserved session's, else the kept
  // order's own while the details match; never an estimate as final
  const shownPricing = isReserved
    ? checkout.pricing
    : isPendingOrderDetails
      ? keptOrder.session?.pricing ?? null
      : null;

  // ─── Failures ───────────────────────────────────────────────────────────

  /** The kit's refusal → the store's copy, beside the button or a toast. */
  const handleFailure = (key) => {
    if (!key) return;
    const message = getKitKeyMessage(key);
    if (START_OVER_KEYS.includes(key)) {
      setReservedKey(null);
      forgetKeptOrder();
    }
    if (needsBagReview(key)) refetch();
    if (IN_PLACE_KEYS.includes(key) || isPromotionKey(key)) {
      setSubmitError(message, key);
    } else {
      toast.error(message);
    }
    // No shipping zone covers the address: point the shopper at it
    if (ADDRESS_KEYS.includes(key)) scrollTo(".Delivery_container");
  };

  // `start` answers null on a refusal; its key is in the kit's state
  useEffect(() => {
    if (checkout.step !== "failed" || !checkout.error) return;
    if (phaseRef.current === "start") handleFailure(checkout.error);
  }, [checkout.step, checkout.error]);

  // ─── Steps ──────────────────────────────────────────────────────────────

  // Best effort: the "email me" checkbox updates the customer profile.
  // PRD-014 FR-2.8 (UX-29): only a real change is written, so an unticked
  // box never turns "never subscribed" into "unsubscribed".
  const saveEmailPreference = (status) => {
    const subscribedCode =
      EMAIL_SUBSCRIBED_STATUS_CODE[EmailSubscribedStatus.SUBSCRIBED];
    const wantsEmail = status === EmailSubscribedStatus.SUBSCRIBED;
    const isSubscribed = user?.emailSubscribedStatus === subscribedCode;
    if (wantsEmail === isSubscribed) return;
    const code = EMAIL_SUBSCRIBED_STATUS_CODE[
      wantsEmail ? EmailSubscribedStatus.SUBSCRIBED : EmailSubscribedStatus.UNSUBSCRIBED
    ];
    client
      .mutate({
        mutation: UPDATE_MY_PROFILE,
        variables: { input: { emailSubscribedStatus: code } },
      })
      .then(({ data }) => {
        if (data?.updateMyProfile) setUser({ ...user, ...data.updateMyProfile });
      })
      .catch(() => {});
  };

  // PRD-014 UX-02: "Continue to payment" never fails silently. Field errors render next
  // to the fields (the delivery form opens itself for a saved address that
  // fails); this names the problem at the button and scrolls to it.
  const onInvalid = (formErrors) => {
    const firstPath = formErrors?.email
      ? "email"
      : formErrors?.shippingAddress
        ? "shippingAddress"
        : "billingAddress";
    setSubmitError(
      firstPath === "email"
        ? "Please enter a valid email address."
        : firstPath === "shippingAddress"
          ? "Please select or complete your delivery address."
          : "Please complete your billing address."
    );
    scrollTo(
      firstPath === "email"
        ? ".contact_container"
        : firstPath === "shippingAddress"
          ? ".Delivery_container"
          : ".Payment_container"
    );
  };

  /** The bag must have loaded before anything is reserved. */
  const isBagReady = () => {
    if (cartData?._id) return true;
    setSubmitError(loading ? BAG_LOADING_MESSAGE : BAG_FAILED_MESSAGE);
    return false;
  };

  // "Continue to payment" (after validation): opens (or reuses) the
  // session for exactly these details and shows its final total; its hold
  // is the shopper's explicit choice.
  const onContinue = async () => {
    if (!isBagReady() || isBusy) return;
    setSubmitError("");
    const values = getValues();
    const input = inputOf(values);
    phaseRef.current = "start";
    const session = await checkout.start(input);
    if (!session) return;
    const fingerprint = await droppedCoupon.check(session);
    setReservedKey(keyOf(input, values.emailSubscribedStatus, fingerprint));
  };

  /** Where a finished payment goes: the status page, else thank-you. */
  const goAfterPayment = (result) => {
    const path = orderStatusPath(result.statusToken);
    setIsLeaving(true);
    router.replace(
      path ||
        (result.orderId
          ? `/checkout/thank-you?orderId=${encodeURIComponent(result.orderId)}`
          : "/checkout/thank-you"),
    );
  };

  const handlePayResult = (result) => {
    if (result.step === "paid" || result.step === "unconfirmed") {
      goAfterPayment(result);
      return;
    }
    if (result.step === "redirecting") {
      setIsLeaving(true);
      return;
    }
    // The kit sends GA4's checkout_error (PAYMENT_DISMISSED) itself
    if (result.step === "dismissed") {
      toast.info("Payment was not completed. You can try again.");
      return;
    }
    if (result.step !== "failed") return;
    // A placed order whose payment failed: the failure page retries it
    const kept = PendingOrderStore.get();
    if (
      result.orderId &&
      kept?.orderId === result.orderId &&
      !NO_RETRY_KEYS.includes(result.reason) &&
      !needsBagReview(result.reason)
    ) {
      setIsLeaving(true);
      router.push(
        `/checkout/payment-failed?orderId=${encodeURIComponent(result.orderId)}`,
      );
      return;
    }
    setKeptVersion((version) => version + 1);
    handleFailure(result.reason);
  };

  /** "Pay now" (reserved for these details): places the order and pays. */
  const onPay = async () => {
    if (payingRef.current || isBusy || !isReserved) return;
    setSubmitError("");
    payingRef.current = true;
    phaseRef.current = "pay";
    try {
      let result;
      if (canPayAgain) {
        result = await checkout.retryPayment(checkout.orderId);
      } else {
        saveEmailPreference(getValues("emailSubscribedStatus"));
        result = await checkout.pay();
      }
      handlePayResult(result);
    } finally {
      payingRef.current = false;
    }
  };

  // Enter in the form: "Pay now" once reserved, else "Continue to payment"
  const onSubmit = () => (isReserved ? onPay() : onContinue());

  return (
    <>
      <div className="checkout-cont" data-lenis-prevent>
        <div className="checkout-left">
          <Heading />
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="checkout-main"
            noValidate
          >
            <ContactDetail
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
            <Delivery
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
              isPreferredAddress={isPendingAddress}
            />
            <Shipping
              pricing={shownPricing}
              isPricing={checkout.step === "reserving"}
              isFreeShippingEnabled={cartData?.isFreeShippingEnabled}
              estimate={shippingEstimate}
              estimating={isEstimatingShipping}
            />
            <BillingAddress
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
            />
            {isPendingOrderDetails && !submitError && (
              <p className="checkout_pending_note" role="status">
                Your order is saved. Continue to payment, then pay to retry
                the payment with the same delivery details.
              </p>
            )}
            {hasPendingOrder && !isPendingOrderDetails && !submitError && (
              <p className="checkout_pending_note" role="status">
                You changed the delivery details of your saved order. Paying
                places a new order with these details; continue to payment
                to see its shipping and final total.
              </p>
            )}
            {!isReserved && !hasPendingOrder && !submitError && (
              <p className="checkout_pending_note" role="status">
                {CONTINUE_HINT}
              </p>
            )}
            {droppedCoupon.notice && !submitError && (
              <p className="checkout_pending_note" role="status">
                {droppedCoupon.notice}
              </p>
            )}
            {submitError && (
              <p className="checkout_submit_error" role="alert">
                {submitError}
                {isSignInRequiredReason(submitErrorKey) && (
                  <>
                    {" "}
                    <Link href={getLoginPath(CHECKOUT_PATH)}>Sign in</Link>
                  </>
                )}
              </p>
            )}
            {!isReserved && (
              <CommonButton
                title={"Continue to payment"}
                loading={isBusy || !isReady}
                testId="checkout-continue"
              />
            )}
            <CommonButton
              title={canPayAgain ? "Pay again" : "Pay now"}
              type="button"
              onClick={onPay}
              loading={isReserved && isBusy}
              disabled={!isReserved || isBusy || !isReady}
              testId="checkout-pay-now"
            />
          </form>
        </div>
        <div className="checkout-right">
          <OrderSummary
            data={cartData}
            pricing={shownPricing}
            isPricing={checkout.step === "reserving"}
            shippingEstimate={shippingEstimate}
            isEstimatingShipping={isEstimatingShipping}
            locked={isBusy}
            refetch={() => refetch()}
          />
        </div>
      </div>
      <Loader isLoading={checkout.step === "verifying" || isLeaving} />
    </>
  );
};

// ─── Path ─────────────────────────────────────────────────────────────────

/** Signed out on a store whose accounts are REQUIRED (PRD-041 FR-3). */
const SignInToCheckout = () => (
  <div id="status_section">
    <h2>
      Sign in <br /> to <span>check out</span>
    </h2>
    <p>
      Sign in with your email to check out. Your bag is saved and comes with
      you.
    </p>
    <CommonButton
      title={"Sign in"}
      type="button"
      href={getLoginPath(CHECKOUT_PATH)}
    />
  </div>
);

/**
 * The checkout for who is here: the customer's (kit session `customer`),
 * the guest's (accounts OPTIONAL) or the sign-in prompt (REQUIRED). The
 * page loader shows while the session or the store's options are read.
 */
const CheckoutView = () => {
  const { status } = useSession();
  const { allowsGuest, loading } = useStoreCheckoutOptions();
  if (status === "customer") return <CustomerCheckout />;
  if (status === "unknown" || loading) return <Loader isLoading />;
  return allowsGuest ? <GuestCheckout /> : <SignInToCheckout />;
};

export default CheckoutView;
