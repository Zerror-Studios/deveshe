"use client";

/**
 * Checkout without signing in (backend PRD-041 FR-4, FR-17), on the kit's
 * `useCheckout().startGuest` → `pay()` (kit 1.1.0).
 *
 * One page, three steps in the store's checkout design:
 * - **Contact:** email and phone (required), first and last name, the
 *   "Email me with news and offers" box (unticked, PRD-014 UX-29) and
 *   "Already have an account? Sign in" (the code sign-in, back to
 *   `/checkout`, which opens the bag merged at sign-in);
 * - **Delivery:** the address form (`Delivery`, no saved addresses for a
 *   guest) and the billing address;
 * - **Payment:** "Continue to payment" opens the guest session (its 15
 *   minute stock hold only on this explicit action, W0V2-02) and shows the
 *   server pricing; "Pay now" (disabled until then, with "Continue to
 *   payment to see your final total") places the order and opens the
 *   payment app; a closed payment window → a toast and "Pay again"
 *   (`retryPayment`; the kit sends GA4's `checkout_error` itself).
 *
 * The same flow as the signed-in checkout (`views/CheckoutView.jsx`). Any
 * change to the contact, the news box, the addresses or the bag (lines or
 * coupon) after "Continue" disables "Pay now" until "Continue" is pressed
 * again (`isReservedFor`). The ads begin checkout is sent once per page
 * load when the page opens with items (`useAdsBeginCheckout`, shared with
 * the signed-in path). The guest checkout token stays
 * in the kit (`GuestCheckoutStore`, this tab only). Once PAID the shopper
 * goes to the order status page (`orderStatusPath(statusToken)`); a
 * failed payment of a placed order goes to `/checkout/payment-failed`,
 * whose "Retry payment" pays the kept order (`retryPayment`).
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "react-toastify";
import { useCheckout } from "@zcom/storefront-kit/client";
import {
  GuestCheckoutStore,
  PendingOrderStore,
  orderStatusPath,
} from "@zcom/storefront-kit/core";
import { CART_LIST } from "@/graphql";
import { useVisitor } from "@/hooks/useVisitor";
import { useAdsBeginCheckout } from "@/hooks/useAdsBeginCheckout";
import { useDroppedCouponCheck } from "@/hooks/useDroppedCouponCheck";
import {
  isPromotionReason,
  isSignInRequiredReason,
} from "@/utils/coupon.util";
import { GuestCheckoutSchema } from "@/validations/CheckoutValidation";
import { EmailSubscribedStatus } from "@/utils/Constant";
import { getKitKeyMessage } from "@/utils/api-error.util";
import { getLoginPath } from "@/utils/redirect.util";
import {
  getCartFingerprint,
  getDetailsKey,
  isReservedFor,
} from "@/utils/checkout-kit.util";
import { CHECKOUT_PATH } from "@/utils/checkout-start.util";
import { toGuestCheckoutInput } from "@/utils/guest-checkout.util";
import Heading from "./Heading";
import Delivery from "./Delivery";
import Shipping from "./Shipping";
import BillingAddress from "./BillingAddress";
import OrderSummary from "./OrderSummery";
import Loader from "./Loader";
import CommonButton from "../common/CommonButton";

// ─── Constants ────────────────────────────────────────────────────────────

/** Answers after which the bag on screen is stale. */
const CART_REFRESH_KEYS = [
  "PRICE_CHANGED",
  "PROMOTION_INVALID",
  "OUT_OF_STOCK",
  "INSUFFICIENT_STOCK",
  "EMPTY_CART",
];
/** Answers that belong to the delivery address. */
const ADDRESS_KEYS = ["SHIPPING_UNAVAILABLE", "ADDRESS_REQUIRED"];
/** Answers that belong to the contact. */
const CONTACT_KEYS = ["INVALID_EMAIL", "INVALID_PHONE"];
/** Failures with no placed order to retry (stay on this page). */
const NO_RETRY_KEYS = ["INVALID_GUEST_TOKEN", "ORDER_CANCELLED", "ORDER_NOT_FOUND"];
/** After any of these the checkout starts over from "Continue". */
const START_OVER_KEYS = ["INVALID_GUEST_TOKEN", "CHECKOUT_EXPIRED", "RESERVATION_RELEASED"];
const CONTINUE_HINT = "Continue to payment to see your final total.";

const DEFAULT_ADDRESS = {
  addressType: "HOME",
  countryCode: "+91",
  country: "India",
};

const scrollTo = (selector) =>
  document
    .querySelector(selector)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

// ─── Component ────────────────────────────────────────────────────────────

const GuestCheckout = () => {
  const router = useRouter();
  const { visitorId } = useVisitor();
  const checkout = useCheckout();
  const [isReady, setIsReady] = useState(false);
  // The details key "Continue to payment" reserved; null until then
  const [reservedKey, setReservedKey] = useState(null);
  const [formError, setFormErrorText] = useState("");
  // The kit key behind `formError` (a "Sign in" link for its answer)
  const [formErrorKey, setFormErrorKey] = useState(null);
  const setFormError = (message, key = null) => {
    setFormErrorText(message);
    setFormErrorKey(key);
  };
  // True once the browser is leaving (status page, payment page)
  const [isLeaving, setIsLeaving] = useState(false);
  const cartFingerprintRef = useRef(null);
  const payingRef = useRef(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const {
    data: response,
    loading,
    error: cartError,
    refetch,
  } = useQuery(CART_LIST, {
    skip: !visitorId,
    variables: { guestId: visitorId },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });
  const cartData = response?.getCart || {};
  const hasItems = (cartData?.cart || []).length > 0;

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
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(GuestCheckoutSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      contact: {
        email: "",
        countryCode: "+91",
        phone: "",
        firstName: "",
        lastName: "",
      },
      shippingAddress: { ...DEFAULT_ADDRESS, primary: true },
      billingAddress: { ...DEFAULT_ADDRESS, primary: false },
      // PRD-014 UX-29: marketing email is opt-in, never pre-ticked
      emailSubscribedStatus: EmailSubscribedStatus.UNSUBSCRIBED,
      useShippingAsBilling: true,
    },
  });

  const values = useWatch({ control });
  const contactPhone = values?.contact?.phone;
  const contactCountryCode = values?.contact?.countryCode;
  const wantsNews =
    values?.emailSubscribedStatus === EmailSubscribedStatus.SUBSCRIBED;

  // The bag and every detail as sent: a change needs "Continue" again
  const cartFingerprint = cartData?._id ? getCartFingerprint(cartData) : null;
  const details = toGuestCheckoutInput(cartData, {
    acceptsMarketing: wantsNews,
    contact: values?.contact,
    shippingAddress: values?.shippingAddress,
    billingAddress: values?.billingAddress,
    useShippingAsBilling: values?.useShippingAsBilling,
  });
  const detailsKey = getDetailsKey(cartFingerprint, details);
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

  // A changed bag or coupon: a kept unpaid order no longer matches it (the
  // kit's fingerprint has the lines, not the coupon), so drop it
  useEffect(() => {
    if (!cartFingerprint) return;
    const previous = cartFingerprintRef.current;
    cartFingerprintRef.current = cartFingerprint;
    if (previous && previous !== cartFingerprint) {
      // The server's own drop of a code that no longer applies keeps the
      // session (its total is the one shown)
      if (droppedCoupon.isExpectedChange(cartFingerprint)) return;
      droppedCoupon.clear();
      PendingOrderStore.clear();
      setReservedKey(null);
    }
  }, [cartFingerprint]);

  // The kit's refusal → the store's copy, at the right step
  useEffect(() => {
    if (checkout.step !== "failed" || !checkout.error) return;
    const key = checkout.error;
    setFormError(getKitKeyMessage(key), key);
    if (START_OVER_KEYS.includes(key)) {
      GuestCheckoutStore.clear();
      PendingOrderStore.clear();
      setReservedKey(null);
    }
    if (CART_REFRESH_KEYS.includes(key) || isPromotionReason(key)) refetch();
    if (ADDRESS_KEYS.includes(key)) scrollTo(".Delivery_container");
    if (CONTACT_KEYS.includes(key)) scrollTo(".contact_container");
  }, [checkout.step, checkout.error]);

  // ─── Contact → delivery prefill ─────────────────────────────────────────

  /** Copies the contact's names and phone into empty delivery fields. */
  const prefillDelivery = () => {
    const contact = getValues("contact") || {};
    const address = getValues("shippingAddress") || {};
    if (!address.firstname && contact.firstName) {
      setValue("shippingAddress.firstname", contact.firstName);
    }
    if (!address.lastname && contact.lastName) {
      setValue("shippingAddress.lastname", contact.lastName);
    }
    if (!address.phone && contact.phone) {
      setValue("shippingAddress.phone", contact.phone);
      setValue("shippingAddress.countryCode", contact.countryCode || "+91");
    }
  };

  // ─── Steps ──────────────────────────────────────────────────────────────

  const onInvalid = (formErrors) => {
    const target = formErrors?.contact
      ? ".contact_container"
      : formErrors?.shippingAddress
        ? ".Delivery_container"
        : ".Payment_container";
    setFormError(
      formErrors?.contact
        ? "Please check your contact details."
        : formErrors?.shippingAddress
          ? "Please complete your delivery address."
          : "Please complete your billing address.",
    );
    scrollTo(target);
  };

  /** "Continue to payment": opens the guest session for these details. */
  const onContinue = async (formValues) => {
    if (!cartData?._id || !hasItems) {
      setFormError(
        loading
          ? "Your bag is still loading. Please try again in a moment."
          : getKitKeyMessage("EMPTY_CART"),
      );
      return;
    }
    setFormError("");
    const reservedDetails = details;
    const session = await checkout.startGuest(
      toGuestCheckoutInput(cartData, { ...formValues, acceptsMarketing: wantsNews }),
    );
    if (!session) return;
    const fingerprint = await droppedCoupon.check(session);
    setReservedKey(getDetailsKey(fingerprint, reservedDetails));
  };

  /** Where a finished payment goes: the status page, else thank-you. */
  const goAfterPayment = (result) => {
    const kept = GuestCheckoutStore.get();
    const path = orderStatusPath(result.statusToken ?? kept?.statusToken);
    const orderId = result.orderId ?? kept?.orderId;
    setIsLeaving(true);
    router.replace(
      path ||
        (orderId
          ? `/checkout/thank-you?orderId=${encodeURIComponent(orderId)}`
          : "/checkout/thank-you"),
    );
  };

  /** "Pay now" (reserved for these details): places the order and pays. */
  const onPay = async () => {
    if (payingRef.current || isBusy || !isReserved) return;
    setFormError("");
    payingRef.current = true;
    let result;
    try {
      result = canPayAgain
        ? await checkout.retryPayment(checkout.orderId)
        : await checkout.pay();
    } finally {
      payingRef.current = false;
    }
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
    const kept = GuestCheckoutStore.get();
    if (kept?.orderId && !NO_RETRY_KEYS.includes(result.reason)) {
      setIsLeaving(true);
      router.push(
        `/checkout/payment-failed?orderId=${encodeURIComponent(kept.orderId)}`,
      );
    }
  };

  // Enter in the form: "Pay now" once reserved, else "Continue to payment"
  const onSubmit = (formValues) =>
    isReserved ? onPay() : onContinue(formValues);

  // ─── States ─────────────────────────────────────────────────────────────

  if (isReady && !visitorId) {
    return (
      <div id="status_section">
        <h2>
          Your bag <br /> is <span>empty</span>
        </h2>
        <p>Add something you love, then come back to check out.</p>
        <CommonButton title={"Go to the shop"} href={"/shop"} type="button" />
      </div>
    );
  }
  if (cartError && !response) {
    return (
      <div id="status_section" role="alert">
        <h2>
          We couldn&rsquo;t load <br /> your <span>bag</span>
        </h2>
        <p>{getKitKeyMessage("NETWORK")}</p>
        <CommonButton title={"Try again"} type="button" onClick={() => refetch()} />
      </div>
    );
  }
  if (response && !hasItems) {
    return (
      <div id="status_section">
        <h2>
          Your bag <br /> is <span>empty</span>
        </h2>
        <p>Add something you love, then come back to check out.</p>
        <CommonButton title={"Go to the shop"} href={"/shop"} type="button" />
      </div>
    );
  }

  const signInPath = getLoginPath(CHECKOUT_PATH);
  const contactErrors = errors?.contact;

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
            {/* ─── Contact ─── */}
            <div className="contact_container">
              <div className="contact_text_cntr">
                <h2 className="same_style_text">Contact</h2>
                <p className="checkout_signin_hint">
                  Already have an account? <Link href={signInPath}>Sign in</Link>
                </p>
              </div>
              <div className="contact_input_cntr">
                <input
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                  autoComplete="email"
                  aria-invalid={Boolean(contactErrors?.email)}
                  {...register("contact.email")}
                />
              </div>
              {contactErrors?.email && (
                <span className="error">{contactErrors.email.message}</span>
              )}
              <div className="Phone_input_cntr div-name">
                <PhoneInput
                  defaultCountry="in"
                  value={`+${contactCountryCode?.replace("+", "") || "91"}${contactPhone || ""}`}
                  className="delivery__phone_btn"
                  inputClassName="delivery__input__phone"
                  inputProps={{ "aria-label": "Phone", autoComplete: "tel" }}
                  onChange={(value, metadata) => {
                    const countryCode = `+${metadata?.country?.dialCode || "91"}`;
                    const numberOnly = value.replace(countryCode, "").trim();
                    setValue("contact.countryCode", countryCode);
                    setValue("contact.phone", numberOnly, {
                      shouldValidate: Boolean(contactErrors?.phone),
                    });
                  }}
                  onBlur={prefillDelivery}
                />
                <input type="hidden" {...register("contact.countryCode")} />
                <input type="hidden" {...register("contact.phone")} />
              </div>
              {contactErrors?.phone && (
                <span className="error">{contactErrors.phone.message}</span>
              )}
              <div className="Name_input_cntr">
                <div>
                  <input
                    className="w-100"
                    type="text"
                    placeholder="First Name"
                    aria-label="First name"
                    autoComplete="given-name"
                    {...register("contact.firstName", { onBlur: prefillDelivery })}
                  />
                  {contactErrors?.firstName && (
                    <span className="error">{contactErrors.firstName.message}</span>
                  )}
                </div>
                <div>
                  <input
                    className="w-100"
                    type="text"
                    placeholder="Last Name"
                    aria-label="Last name"
                    autoComplete="family-name"
                    {...register("contact.lastName", { onBlur: prefillDelivery })}
                  />
                  {contactErrors?.lastName && (
                    <span className="error">{contactErrors.lastName.message}</span>
                  )}
                </div>
              </div>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={wantsNews}
                  onChange={(event) =>
                    setValue(
                      "emailSubscribedStatus",
                      event.target.checked
                        ? EmailSubscribedStatus.SUBSCRIBED
                        : EmailSubscribedStatus.UNSUBSCRIBED,
                    )
                  }
                />
                <span className="checkmark">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 14"
                    focusable="false"
                    aria-hidden="true"
                    className="arrow"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m12.1 2.8-5.877 8.843a.35.35 0 0 1-.54.054L1.4 7.4"
                    ></path>
                  </svg>
                </span>
                <h6 className="">Email me with news and offers</h6>
              </label>
            </div>

            {/* ─── Delivery ─── */}
            <Delivery
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
            />
            <BillingAddress
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
            />

            {/* ─── Payment ─── */}
            <Shipping
              pricing={isReserved ? checkout.pricing : null}
              isPricing={checkout.step === "reserving"}
              isFreeShippingEnabled={cartData?.isFreeShippingEnabled}
            />
            {!isReserved && !formError && (
              <p className="checkout_pending_note" role="status">
                {CONTINUE_HINT}
              </p>
            )}
            {droppedCoupon.notice && !formError && (
              <p className="checkout_pending_note" role="status">
                {droppedCoupon.notice}
              </p>
            )}
            {formError && (
              <p className="checkout_submit_error" role="alert">
                {formError}
                {isSignInRequiredReason(formErrorKey) && (
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
            pricing={isReserved ? checkout.pricing : null}
            isPricing={checkout.step === "reserving"}
            locked={isBusy}
            refetch={() => refetch()}
          />
        </div>
      </div>
      <Loader isLoading={checkout.step === "verifying" || isLeaving} />
    </>
  );
};

export default GuestCheckout;
