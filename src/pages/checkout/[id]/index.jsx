import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutSchema } from "@/validations/CheckoutValidation";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  CART_LIST,
  COMPLETE_CHECKOUT,
  CREATE_CHECKOUT_SESSION,
  CREATE_PAYMENT_SESSION,
  GET_CHECKOUT_SESSION,
  UPDATE_MY_PROFILE,
  VERIFY_PAYMENT,
} from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import Heading from "@/components/checkout/Heading";
import ContactDetail from "@/components/checkout/ContactDetail";
import Delivery from "@/components/checkout/Delivery";
import Shipping from "@/components/checkout/Shipping";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummary from "@/components/checkout/OrderSummery";
import { EmailSubscribedStatus } from "@/utils/Constant";
import { openPaymentCheckout } from "@/utils/payment-checkout.util";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/auth-store";
import Loader from "@/components/checkout/Loader";
import gsap from "gsap";
import CommonButton from "@/components/common/CommonButton";
import { trackEcomEvent } from "@/utils/analytics";
import {
  createReasonError,
  getAnyErrorMessage,
  getErrorCode,
  getErrorReason,
} from "@/utils/api-error.util";
import { getLoginPath } from "@/utils/redirect.util";
import {
  PendingOrder,
  getCartFingerprint,
  getCheckoutDetailsFingerprint,
} from "@/utils/pending-order.util";
import {
  getCheckoutAttribution,
  getCheckoutConsent,
} from "@/utils/ad-click-ids.util";
import {
  CheckoutStepEnum,
  CtaEnum,
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackCheckoutError,
  trackCtaClick,
} from "@/utils/analytics-events.util";

// Contract flow (PRD-002 WS-C, PRD-011): cart → checkout session (poll
// RESERVED) → completeCheckout (order) → payment session → the store's
// payment app (`openPaymentCheckout`) → verifyPayment. PayU posts back to
// `/api/payments/return` → `/checkout/payment-return`.
//
// PRD-014 W0V-C-03 / W0V2-02: a checkout session takes a 15-minute stock
// hold, so it is opened for pricing only on an explicit shopper action:
// "Show final total" at the shipping step, or "Pay now". Never on page
// load, a preselected address or typing. "Pay now" sends the same details
// and the backend returns that same active session (R2-C8); changed
// details need a new confirmation, and the backend then replaces the
// session and releases its hold.
//
// PRD-014 Wave 1: a ₹0 total (COM-08) is placed PAID by `completeCheckout`,
// so no payment session is opened and the shopper goes to thank-you.
// `SHIPPING_UNAVAILABLE` (no shipping zone covers the address) keeps the
// form open and scrolls to the delivery address so it can be changed.
const RESERVATION_POLL_INTERVAL_MS = 1000;
const RESERVATION_POLL_ATTEMPTS = 20;
const ORDER_ADDRESS_FIELDS = [
  "firstname",
  "lastname",
  "addressType",
  "flat",
  "addressline1",
  "addressline2",
  "landmark",
  "phone",
  "countryCode",
  "city",
  "country",
  "states",
  "pincode",
];
const CART_REFRESH_REASONS = ["PRICE_CHANGED", "PROMOTION_INVALID", "OUT_OF_STOCK"];
// The order (or its stock hold) is gone: the next attempt starts over.
const ORDER_RESET_REASONS = [
  "PRICE_CHANGED",
  "CHECKOUT_EXPIRED",
  "RESERVATION_RELEASED",
  "ORDER_CANCELLED",
];
// CustomerProfile.emailSubscribedStatus is numeric on the backend
const EMAIL_SUBSCRIBED_STATUS_CODE = {
  [EmailSubscribedStatus.UNSUBSCRIBED]: 0,
  [EmailSubscribedStatus.SUBSCRIBED]: 1,
  [EmailSubscribedStatus.NEVER_SUBSCRIBED]: 2,
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Form address → OrderAddressInput (flat strings only)
const toOrderAddressInput = (address = {}, email) => {
  const input = { email };
  ORDER_ADDRESS_FIELDS.forEach((field) => {
    if (address?.[field]) input[field] = String(address[field]);
  });
  return input;
};

// Email and both order addresses exactly as sent to the server (VBUG-4).
const toCheckoutDetails = (formData) => {
  const { email, shippingAddress, billingAddress, useShippingAsBilling } =
    formData;
  return {
    email,
    shippingAddress: toOrderAddressInput(shippingAddress, email),
    billingAddress: toOrderAddressInput(
      useShippingAsBilling ? shippingAddress : billingAddress,
      email
    ),
  };
};

const CheckoutPage = ({ meta }) => {
  const router = useRouter();
  const client = useApolloClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  // True from opening the payment window until its result or close (RBUG-15).
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { isLoggedIn, user, setUser } = useAuthStore((state) => state);
  const submittingRef = useRef(false);
  const verifyingRef = useRef(false);
  // Unpaid order for this cart, kept across reloads (RBUG-8/RBUG-9):
  // `{ orderId, detailsFingerprint }` or null.
  const pendingOrderRef = useRef(null);
  // PRD-014 UX-03 / W0V-C-03: the checkout session's server pricing
  // (shipping, discount, tax, total) for the summary; null until a session
  // exists for the current bag and details.
  const [sessionPricing, setSessionPricing] = useState(null);
  const [isPricing, setIsPricing] = useState(false);
  const [pricingError, setPricingError] = useState("");
  // Bumped on every pricing run; an older answer is ignored.
  const pricingRequestRef = useRef(0);
  // The bag + details key the shown pricing belongs to (no pending order).
  const pricedKeyRef = useRef(null);
  // W0V2-02: the bag + details key the shopper confirmed with "Show final
  // total"; any change drops it, so new details need a new confirmation.
  const confirmedKeyRef = useRef(null);
  // Bumped by each confirmation so the pricing effect runs (also a retry).
  const [pricingConfirmation, setPricingConfirmation] = useState(0);
  // The pending order's checkout session whose pricing is shown.
  const pricedCheckoutIdRef = useRef(null);
  // Set once the payment succeeded: nothing is priced again.
  const isCheckoutDoneRef = useRef(false);
  // PRD-014 UX-02: a submit that fails validation says so at the button.
  const [submitError, setSubmitError] = useState("");
  // PRD-014 FR-0.12: an unpaid order is kept for this bag (retry path).
  const [hasPendingOrder, setHasPendingOrder] = useState(false);
  const beginCheckoutTrackedRef = useRef(false);
  // PRD-013: add_shipping_info once per visit; the payment app for errors.
  const shippingInfoTrackedRef = useRef(false);
  const paymentProviderRef = useRef(null);
  const cartListPayload = {
    cartId: router?.query?.id,
  };
  const {
    data: response,
    loading,
    refetch,
  } = useQuery(CART_LIST, {
    skip: !router?.query?.id || !isLoggedIn,
    variables: cartListPayload,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  const cartData = response?.getCart || {};

  // Restore the unpaid order after a reload; a changed bag or coupon
  // (fingerprint mismatch) drops it, so the total is never stale.
  useEffect(() => {
    if (!cartData?._id) return;
    pendingOrderRef.current = PendingOrder.read(cartData);
    setHasPendingOrder(Boolean(pendingOrderRef.current));
  }, [cartData]);

  // A changed bag or coupon re-prices through the pricing effect below.
  const forgetPendingOrder = () => {
    PendingOrder.clear(cartData?._id);
    pendingOrderRef.current = null;
    pricedCheckoutIdRef.current = null;
    pricedKeyRef.current = null;
    confirmedKeyRef.current = null;
    setHasPendingOrder(false);
    setSessionPricing(null);
  };

  // The payment went through: stop pricing and forget the order.
  const finishCheckout = () => {
    isCheckoutDoneRef.current = true;
    forgetPendingOrder();
  };

  // Checkout is customer-only (middleware checks the cookie hint).
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace(getLoginPath(router.asPath));
    }
  }, [isHydrated, isLoggedIn]);

  useEffect(() => {
    if (beginCheckoutTrackedRef.current || !cartData?.cart?.length) return;
    beginCheckoutTrackedRef.current = true;
    trackEcomEvent.beginCheckout(cartData.cart, cartData.discountedPrice);
  }, [cartData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CheckoutSchema),
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

  // ─── Server pricing before "Pay now" (W0V-C-03, W0V2-02) ────────────────

  const [
    watchedEmail,
    watchedShipping,
    watchedBilling,
    watchedUseShippingAsBilling,
  ] = useWatch({
    control,
    name: [
      "email",
      "shippingAddress",
      "billingAddress",
      "useShippingAsBilling",
    ],
  });
  const pricingValues = {
    email: watchedEmail,
    shippingAddress: watchedShipping,
    billingAddress: watchedBilling,
    useShippingAsBilling: watchedUseShippingAsBilling,
  };
  // Only a form that would pass "Pay now" validation is priced.
  const pricingDetails = CheckoutSchema.safeParse(pricingValues).success
    ? toCheckoutDetails(pricingValues)
    : null;
  const pricingKey =
    pricingDetails && cartData?._id
      ? `${getCartFingerprint(cartData)}|${getCheckoutDetailsFingerprint(
          pricingDetails
        )}`
      : null;
  const isPendingOrderDetails =
    hasPendingOrder &&
    !!pricingDetails &&
    PendingOrder.matches(pendingOrderRef.current, pricingDetails);
  const isCheckoutBusy = isLoading || isAwaitingPayment || isPageLoading;

  // FR-0.12: on a retry the saved address of the kept order is preselected
  // (not the primary one), so paying again reuses that order.
  const isPendingAddress = useCallback(
    (formAddress) => {
      if (!hasPendingOrder || !pendingOrderRef.current) return false;
      return PendingOrder.matches(
        pendingOrderRef.current,
        toCheckoutDetails({
          email: watchedEmail,
          shippingAddress: formAddress,
          billingAddress: formAddress,
          useShippingAsBilling: true,
        })
      );
    },
    [hasPendingOrder, watchedEmail]
  );

  useEffect(() => {
    const requestId = ++pricingRequestRef.current;
    const isCurrent = () => requestId === pricingRequestRef.current;
    if (isCheckoutBusy || isCheckoutDoneRef.current) {
      setIsPricing(false);
      return undefined;
    }
    // Changed details (or bag) need a new confirmation
    if (confirmedKeyRef.current !== pricingKey) confirmedKeyRef.current = null;
    setPricingError("");
    if (!pricingKey) {
      pricedKeyRef.current = null;
      setSessionPricing(null);
      setIsPricing(false);
      return undefined;
    }

    // A kept (unpaid) order: show its own session's pricing while the
    // details match; never open a second session for it
    const pending = pendingOrderRef.current;
    if (pending) {
      pricedKeyRef.current = null;
      if (!PendingOrder.matches(pending, pricingDetails)) {
        pricedCheckoutIdRef.current = null;
        setSessionPricing(null);
        setIsPricing(false);
        return undefined;
      }
      if (
        !pending.checkoutId ||
        pricedCheckoutIdRef.current === pending.checkoutId
      ) {
        setIsPricing(false);
        return undefined;
      }
      setIsPricing(true);
      client
        .query({
          query: GET_CHECKOUT_SESSION,
          variables: { id: pending.checkoutId },
          fetchPolicy: "network-only",
        })
        .then(({ data }) => {
          if (!isCurrent()) return;
          pricedCheckoutIdRef.current = pending.checkoutId;
          setSessionPricing(data?.getCheckoutSession?.pricing ?? null);
        })
        .catch(() => {
          if (isCurrent()) setSessionPricing(null);
        })
        .finally(() => {
          if (isCurrent()) setIsPricing(false);
        });
      return undefined;
    }

    pricedCheckoutIdRef.current = null;
    if (pricedKeyRef.current === pricingKey) {
      setIsPricing(false);
      return undefined;
    }
    pricedKeyRef.current = null;
    setSessionPricing(null);
    // No explicit confirmation for these details: no session, no hold
    if (confirmedKeyRef.current !== pricingKey) {
      setIsPricing(false);
      return undefined;
    }
    setIsPricing(true);
    (async () => {
      try {
        const { data } = await client.mutate({
          mutation: CREATE_CHECKOUT_SESSION,
          variables: {
            cartId: cartData?._id,
            shippingAddress: pricingDetails.shippingAddress,
            billingAddress: pricingDetails.billingAddress,
            attribution: getCheckoutAttribution(),
            consent: getCheckoutConsent(),
          },
        });
        if (!isCurrent()) return;
        const pricing = data?.createCheckoutSessionFromCart?.pricing ?? null;
        pricedKeyRef.current = pricing ? pricingKey : null;
        setSessionPricing(pricing);
      } catch (error) {
        if (!isCurrent()) return;
        setSessionPricing(null);
        // "Show final total" again retries; nothing retries on its own
        confirmedKeyRef.current = null;
        setPricingError(
          getAnyErrorMessage(
            error,
            "We could not calculate shipping for this address."
          )
        );
        const reason = getErrorReason(error);
        if (CART_REFRESH_REASONS.includes(reason)) refetch(cartListPayload);
      } finally {
        if (isCurrent()) setIsPricing(false);
      }
    })();
    return undefined;
  }, [pricingKey, hasPendingOrder, isCheckoutBusy, pricingConfirmation]);

  const waitForReservation = async (initialSession) => {
    let session = initialSession;
    for (let attempt = 0; attempt <= RESERVATION_POLL_ATTEMPTS; attempt += 1) {
      const status = session?.status;
      if (status === "RESERVED" || status === "COMPLETED") return session;
      if (status === "FAILED") {
        throw createReasonError(session.failureReason || "CHECKOUT_FAILED");
      }
      if (status === "EXPIRED") throw createReasonError("CHECKOUT_EXPIRED");

      await wait(RESERVATION_POLL_INTERVAL_MS);
      const { data } = await client.query({
        query: GET_CHECKOUT_SESSION,
        variables: { id: initialSession.id },
        fetchPolicy: "network-only",
      });
      session = data?.getCheckoutSession;
    }
    throw createReasonError("RESERVATION_PENDING");
  };

  // Creates the UN_PAID order once; a retried payment reuses it while the
  // email and addresses are unchanged. A shopper who closes Nimbbl and edits
  // them gets a new order with the new details (VBUG-4). Returns
  // `{ orderId, isFree }`; a ₹0 order is already PAID (COM-08).
  const placeOrder = async (formData) => {
    const details = toCheckoutDetails(formData);
    if (PendingOrder.matches(pendingOrderRef.current, details)) {
      return { orderId: pendingOrderRef.current.orderId, isFree: false };
    }
    if (pendingOrderRef.current) forgetPendingOrder();

    const { data: created } = await client.mutate({
      mutation: CREATE_CHECKOUT_SESSION,
      variables: {
        cartId: cartData?._id,
        shippingAddress: details.shippingAddress,
        billingAddress: details.billingAddress,
        // PRD-012: GA ids and UTMs (analytics consent); PRD-034 FR-1.4:
        // ad click ids and Meta cookies (marketing consent) + the choice
        attribution: getCheckoutAttribution(),
        consent: getCheckoutConsent(),
      },
    });
    // Same details as the pricing step: the backend returns that session
    const session = await waitForReservation(
      created?.createCheckoutSessionFromCart
    );
    if (session?.pricing) setSessionPricing(session.pricing);
    pricedCheckoutIdRef.current = session.id;

    const { data: completed } = await client.mutate({
      mutation: COMPLETE_CHECKOUT,
      variables: { checkoutId: session.id },
    });
    const orderId = completed?.completeCheckout?.orderId;
    if (!orderId) throw createReasonError("CHECKOUT_FAILED");
    if (completed.completeCheckout.pricing?.total === 0) {
      return { orderId, isFree: true };
    }

    pendingOrderRef.current = PendingOrder.save(
      cartData,
      orderId,
      details,
      session.id
    );
    setHasPendingOrder(true);
    return { orderId, isFree: false };
  };

  const handleOrderPayment = async (payload, paymentSession, orderId) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setIsPageLoading(true);
    let pathname = "/checkout/payment-failed";
    try {
      const { data } = await client.mutate({
        mutation: VERIFY_PAYMENT,
        variables: {
          payload: {
            providerOrderId: paymentSession.providerOrderId,
            ...payload,
          },
        },
      });
      const result = data?.verifyPayment;
      // PAID is confirmed asynchronously; the thank-you page polls myOrder.
      if (result?.success || result?.status !== "FAILED") {
        pathname = "/checkout/thank-you";
        finishCheckout();
      } else {
        trackCheckoutError(
          CheckoutStepEnum.PAYMENT,
          result?.status || "FAILED",
          paymentProviderRef.current,
        );
      }
    } catch (error) {
      const reason = getErrorReason(error);
      if (reason === "ALREADY_PAID") {
        pathname = "/checkout/thank-you";
        finishCheckout();
      } else {
        trackCheckoutError(
          CheckoutStepEnum.PAYMENT,
          reason || getErrorCode(error) || "VERIFY_FAILED",
          paymentProviderRef.current,
        );
      }
      console.error(`Error in Payment Order: ${error.message}`);
      toast.error(getAnyErrorMessage(error, "We could not verify your payment."));
    } finally {
      verifyingRef.current = false;
    }
    await router.push({ pathname, query: { orderId } });
    setIsPageLoading(false);
  };

  const launchPaymentCheckout = async (paymentSession, orderId) => {
    // A window can report its close more than once
    let isCallbackHandled = false;
    try {
      await openPaymentCheckout(paymentSession, {
        onResult: async (payload) => {
          if (isCallbackHandled) return;
          isCallbackHandled = true;
          try {
            await handleOrderPayment(payload, paymentSession, orderId);
          } catch (err) {
            console.error("Error handling the payment result:", err);
          } finally {
            setIsAwaitingPayment(false);
          }
        },
        onDismiss: () => {
          if (isCallbackHandled) return;
          isCallbackHandled = true;
          trackCheckoutError(
            CheckoutStepEnum.PAYMENT,
            "PAYMENT_DISMISSED",
            paymentProviderRef.current,
          );
          setIsAwaitingPayment(false);
          toast.info("Payment was not completed. You can try again.");
        },
      });
    } catch (error) {
      console.error("Error launching checkout:", error);
      trackCheckoutError(
        CheckoutStepEnum.PAYMENT,
        "PAYMENT_WINDOW_FAILED",
        paymentProviderRef.current,
      );
      setIsAwaitingPayment(false);
      toast.error("Could not open the payment window. Please try again.");
    }
  };

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

  // PRD-014 UX-02: "Pay now" never fails silently. Field errors render next
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
    const target = document.querySelector(
      firstPath === "email"
        ? ".contact_container"
        : firstPath === "shippingAddress"
          ? ".Delivery_container"
          : ".Payment_container"
    );
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // "Show final total": validates like "Pay now", then opens the session
  // for exactly these details (its hold is the shopper's explicit choice).
  const onConfirmDetails = handleSubmit(() => {
    if (!pricingKey) {
      setSubmitError(
        loading
          ? "Your bag is still loading. Please try again in a moment."
          : "We could not load your bag. Please refresh the page."
      );
      return;
    }
    setSubmitError("");
    confirmedKeyRef.current = pricingKey;
    setPricingConfirmation((count) => count + 1);
  }, onInvalid);

  const onSubmit = async (data) => {
    if (submittingRef.current || isAwaitingPayment) return;
    if (!cartData?._id) {
      setSubmitError(
        loading
          ? "Your bag is still loading. Please try again in a moment."
          : "We could not load your bag. Please refresh the page."
      );
      return;
    }
    setSubmitError("");
    submittingRef.current = true;
    setIsLoading(true);
    // PRD-013 Q3: the validated form is the address step's completion.
    if (!shippingInfoTrackedRef.current) {
      shippingInfoTrackedRef.current = true;
      trackAddShippingInfo(
        cartData,
        cartData?.isFreeShippingEnabled ? "free" : "standard",
      );
    }
    let orderId = null;
    try {
      const placed = await placeOrder(data);
      orderId = placed.orderId;
      saveEmailPreference(data.emailSubscribedStatus);
      if (placed.isFree) {
        finishCheckout();
        await router.push({
          pathname: "/checkout/thank-you",
          query: { orderId },
        });
        return;
      }
      const { data: paymentResponse } = await client.mutate({
        mutation: CREATE_PAYMENT_SESSION,
        variables: { input: { orderId } },
      });
      const paymentSession = paymentResponse?.createPaymentSession;
      paymentProviderRef.current =
        paymentSession?.checkout?.provider?.toLowerCase() || null;
      if (!paymentSession?.checkout) {
        throw new Error("Payment could not be started");
      }
      // PRD-013 Q3: the payment window is the payment step.
      trackAddPaymentInfo(cartData, paymentProviderRef.current);
      setIsAwaitingPayment(true);
      await launchPaymentCheckout(paymentSession, orderId);
    } catch (err) {
      console.error(err);
      const reason = err?.reason || getErrorReason(err);
      if (reason === "ALREADY_PAID" && pendingOrderRef.current) {
        const paidOrderId = pendingOrderRef.current.orderId;
        finishCheckout();
        router.push({
          pathname: "/checkout/thank-you",
          query: { orderId: paidOrderId },
        });
        return;
      }
      // Before an order exists the failure belongs to the address step.
      trackCheckoutError(
        orderId ? CheckoutStepEnum.PAYMENT : CheckoutStepEnum.ADDRESS,
        reason ||
          getErrorCode(err) ||
          (orderId ? "PAYMENT_START_FAILED" : "CHECKOUT_FAILED"),
        orderId ? paymentProviderRef.current : undefined,
      );
      if (ORDER_RESET_REASONS.includes(reason)) forgetPendingOrder();
      // No order yet: the shown pricing may be stale, and it is opened
      // again only when the shopper confirms (W0V2-02)
      if (!orderId) {
        pricedKeyRef.current = null;
        confirmedKeyRef.current = null;
        setSessionPricing(null);
      }
      if (CART_REFRESH_REASONS.includes(reason)) {
        refetch(cartListPayload);
      }
      toast.error(getAnyErrorMessage(err, "Checkout failed. Please try again."));
      // No shipping zone covers the address: point the shopper at it.
      if (reason === "SHIPPING_UNAVAILABLE") {
        setSubmitError(getAnyErrorMessage(err));
        document
          .querySelector(".Delivery_container")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    gsap.set([leftRef.current, rightRef.current], {
      opacity: 0,
      y: 100,
    });

    tl.to([leftRef.current, rightRef.current], {
      opacity: 1,
      y: 0,
      duration: 1,
    });

    return () => tl.kill();
  }, []);

  return (
    <>
      <SeoHeader meta={meta} />
      <div className="checkout-cont">
        <div className="checkout-left" ref={leftRef}>
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
              pricing={sessionPricing}
              isPricing={isPricing}
              error={pricingError}
              isFreeShippingEnabled={cartData?.isFreeShippingEnabled}
              onConfirm={
                hasPendingOrder || isCheckoutBusy ? undefined : onConfirmDetails
              }
            />
            <BillingAddress
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
            />
            {isPendingOrderDetails && !submitError && (
              <p className="checkout_pending_note" role="status">
                Your order is saved. Pay now to retry the payment with the
                same delivery details.
              </p>
            )}
            {hasPendingOrder && !isPendingOrderDetails && !submitError && (
              <p className="checkout_pending_note" role="status">
                You changed the delivery details of your saved order. Paying
                now places a new order with these details; its shipping and
                total are confirmed when you pay.
              </p>
            )}
            {submitError && (
              <p className="checkout_submit_error" role="alert">
                {submitError}
              </p>
            )}
            <CommonButton
              title={"Pay now"}
              loading={isLoading || isAwaitingPayment}
              onClick={() => trackCtaClick(CtaEnum.PAY_NOW)}
              testId="checkout-pay-now"
            />
          </form>
        </div>
        <div className="checkout-right" ref={rightRef}>
          <OrderSummary
            data={cartData}
            pricing={sessionPricing}
            isPricing={isPricing}
            locked={isLoading || isAwaitingPayment || isPageLoading}
            refetch={() => refetch(cartListPayload)}
          />
        </div>
      </div>
      <Loader isLoading={isPageLoading} />
    </>
  );
};

export default CheckoutPage;

export async function getServerSideProps({ params }) {
  const meta = {
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
    primaryKeywords: ["DeVeSheDreams checkout", "secure checkout"],
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
  return {
    props: {
      meta: meta,
    },
  };
}
