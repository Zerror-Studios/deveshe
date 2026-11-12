import React, { useState } from "react";
import Link from "next/link";
import z from "zod";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { APPLY_CART_PROMOTION, REMOVE_CART_PROMOTION } from "@/graphql";
import {
  getErrorCode,
  getErrorMessage,
  getErrorReason,
} from "@/utils/api-error.util";
import {
  COUPON_CODE_MAX_LENGTH,
  isPromotionReason,
  isSignInRequiredReason,
  normaliseCouponCode,
} from "@/utils/coupon.util";
import { getLoginPath } from "@/utils/redirect.util";
import { CHECKOUT_PATH } from "@/utils/checkout-start.util";
import {
  CtaEnum,
  trackCouponApply,
  trackCouponFailed,
  trackCtaClick,
} from "@/utils/analytics-events.util";

const couponSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .min(1, "Coupon code is required")
    .max(COUPON_CODE_MAX_LENGTH),
});
// `locked` freezes the coupon while an order is being placed or paid
// (RBUG-9); a later coupon change drops the pending order (fingerprint).
// `pricing` is the checkout session's server snapshot (PRD-014 UX-03,
// W0V-C-03): once present, subtotal, discount, shipping, tax and total come
// from it, so the total shown is the amount charged. Without it the total is
// labelled as one before shipping, never as final.
const OrderSummary = ({
  data,
  refetch,
  locked = false,
  pricing = null,
  isPricing = false,
}) => {
  const {
    totalprice = 0,
    itemcount = 0,
    isFreeShippingEnabled = false,
    totalDiscount = 0,
    cart = [],
  } = data || {};
  const {
    promotionId: isCouponApplied,
    promotionCode: couponCode,
  } = data?.promotion || {};
  const { visitorId } = useVisitor();
  const { isLoggedIn } = useAuthStore((state) => state);
  const [applyCoupon, { loading }] = useMutation(APPLY_CART_PROMOTION);
  const [removeCoupon, { loading: removeLoading }] = useMutation(REMOVE_CART_PROMOTION);
  // A refused code: its own message under the field (and "Sign in" when
  // the code needs an account)
  const [couponError, setCouponError] = useState(null);
  // 0 is a real total (a 100% code); only a bag that hasn't loaded has none
  const discountedPrice =
    typeof data?.discountedPrice === "number" ? data.discountedPrice : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(couponSchema),
  });

  useEffect(() => {
    if (couponCode) {
      setValue("couponCode", couponCode);
    } else {
      setValue("couponCode", "");
    }
  }, [couponCode, setValue]);

  const onSubmit = async (data) => {
    if (loading || locked) return;
    const couponCode = data?.couponCode || "";
    trackCtaClick(CtaEnum.APPLY_COUPON);
    setCouponError(null);
    try {
      const input = {
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
        promotionCode: couponCode || null,
      };
      const { data: response } = await applyCoupon({
        variables: { ...input },
      });
      const { _id } = response?.applyCartPromotion || {};
      if (_id) {
        trackCouponApply(couponCode);
        // reset(); // Don't reset, let it persist
        await refetch();
        toast.success("Coupon Applied successfully!");
      }
    } catch (err) {
      console.error(err);
      // PRD-013: the reason is the server code, never the message text.
      trackCouponFailed(
        couponCode,
        getErrorReason(err) || getErrorCode(err) || "UNKNOWN",
      );
      const reason = getErrorReason(err);
      const message = getErrorMessage(err, "Failed to apply coupon");
      if (isPromotionReason(reason)) {
        setCouponError({ message, reason });
      } else {
        toast.error(message);
      }
      reset();
    }
  };

  const onRemoveCoupon = async () => {
    if (removeLoading || locked) return;
    setCouponError(null);
    try {
      const variables = {
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };
      await removeCoupon({ variables });
      await refetch();
      toast.success("Coupon removed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to remove coupon"));
    }
  };
  const applyCode = handleSubmit(onSubmit);
  const couponField = register("couponCode");

  return (
    <div className="final-checkout-cont">
      <div className="checkout-t">Order Summary ({itemcount})</div>

      <div className="checkout-items-cont">
        {cart &&
          cart?.map((item, index) => {
            const price = item?.price || null;
            return (
              <div
                key={index}
                className="summary-cont"
                style={index < cart.length - 1 ? {} : { borderBottom: "none" }}
              >
                {!price ? (
                  //   <FinalpriceLoader2 />
                  <></>
                ) : (
                  <>
                    <div className="summary-price"> &#8377; {price}</div>
                  </>
                )}
                <div className="summary-img-cont">
                  <img
                    src={item?.asset?.path || ""}
                    alt={item?.asset?.altText || ""}
                    style={{ maxHeight: "100%" }}
                  />
                </div>
                <div className="summary-details">
                  <div className="summary-name">{item.name}</div>
                  <div style={{ fontSize: "12px" }}>
                    {" "}
                    Qty: {item?.qty || ""}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <div className={`promo-cont t3`}>
        <input
          type="text"
          className="promo-input"
          placeholder="Discount Code or Gift Card"
          disabled={loading || isCouponApplied || locked}
          maxLength={COUPON_CODE_MAX_LENGTH}
          aria-label="Discount code"
          {...couponField}
          // Normalise, then tell react-hook-form, so the form value is
          // always current (Safari keeps focus, so blur never comes)
          onChange={(e) => {
            e.target.value = normaliseCouponCode(e.target.value);
            setCouponError(null);
            couponField.onChange(e);
          }}
          // Enter applies the code; it never submits anything else
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (!isCouponApplied) applyCode();
          }}
        />
        {isCouponApplied ? (
          <button
            type="button"
            className="_btn_wrapper _btn_height _w-full RemoveBtn"
            onClick={onRemoveCoupon}
            disabled={removeLoading || locked}
            style={{ backgroundColor: "#ff4d4d", color: "white" }}
          >
            {removeLoading ? "Removing..." : "Remove"}
          </button>
        ) : (
          <button
            type="button"
            className="_btn_wrapper _btn_height _w-full ApplyBtn"
            onClick={applyCode}
            disabled={loading || locked}
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        )}
      </div>
      {errors.couponCode && (
        <span className="error-text">{errors.couponCode.message}</span>
      )}
      {couponError && !errors.couponCode && (
        <span className="error-text" role="alert">
          {couponError.message}
          {isSignInRequiredReason(couponError.reason) && (
            <>
              {" "}
              <Link href={getLoginPath(CHECKOUT_PATH)}>Sign in</Link>
            </>
          )}
        </span>
      )}
      <div className="checkout-price-cont">
        <div className="cpp">
          Subtotal:
          {pricing ? (
            <div className="cpp-p"> &#8377; {pricing.subtotal}</div>
          ) : !totalprice ? (
            // <FinalpriceLoader2 />
            <></>
          ) : (
            <div className="cpp-p"> &#8377; {data?.pricesIncludeTax ? (totalprice - (data?.totalTax || 0)).toFixed(2) : totalprice}</div>
          )}
        </div>
        {(pricing ? pricing.discount : totalDiscount) > 0 && (
          <div className="cpp">
            Discount:
            <div className="cpp-p">
              {`- ${String.fromCharCode(8377)} ${pricing ? pricing.discount : totalDiscount}`}

            </div>
          </div>
        )}
        <div className="cpp">
          Shipping:
          <div className="cpp-p">
            {pricing
              ? pricing.isFreeShipping || !pricing.shipping
                ? "Free"
                : `${String.fromCharCode(8377)} ${pricing.shipping}`
              : isPricing
                ? "Calculating…"
                : isFreeShippingEnabled
                  ? "Free"
                  : "Calculated at payment"}
          </div>
        </div>

        {pricing ? (
          <div className="tax_breakdown_section">
            <div className="total_tax_row">
              <span className="total_tax_label">Total Tax</span>
              <div className="total_tax_value">&#8377; {pricing.tax}</div>
            </div>
            {pricing.pricesIncludeTax && (
              <div className="inclusive_tax_msg">
                * Inclusive of all taxes
              </div>
            )}
          </div>
        ) : data?.taxBreakdown?.length > 0 && (
          <div className="tax_breakdown_section">
            {data.taxBreakdown.map((tax, index) => (
              <div key={index} className="tax_row">
                <span className="tax_name">{tax.name} ({tax.rate}%)</span>
                <div className="tax_amount">&#8377; {tax.amount}</div>
              </div>
            ))}
            <div className="total_tax_row">
              <span className="total_tax_label">Total Tax</span>
              <div className="total_tax_value">&#8377; {data.totalTax}</div>
            </div>
            {data.pricesIncludeTax && (
              <div className="inclusive_tax_msg">
                * Inclusive of all taxes
              </div>
            )}
          </div>
        )}
      </div>
      <div className="checkout-total">
        {pricing
          ? "Total:"
          : isFreeShippingEnabled
            ? "Estimated total:"
            : "Total before shipping:"}
        {pricing ? (
          <div className="checkout-price">&#8377; {pricing.total}</div>
        ) : discountedPrice === null ? (
          //   <FinalpriceLoader2 />
          <></>
        ) : (
          <div className="checkout-price">&#8377; {discountedPrice}</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OrderSummary);
