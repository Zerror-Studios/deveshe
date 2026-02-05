import React from "react";
import z from "zod";
import { renderVariants } from "@/utils/Util";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TokenManager } from "@/utils/tokenManager";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { APPLY_CART_COUPON, REMOVE_CART_COUPON } from "@/graphql";

const couponSchema = z.object({ couponCode: z.string().min(1, "Coupon code is required") });
const OrderSummary = ({ data, refetch }) => {
  const {
    totalprice = 0,
    itemcount = 0,
    isFreeShippingEnabled = false,
    discountedPrice = 0,
    totalDiscount = 0,
    cart = [],
    coupon: { couponId: isCouponApplied, couponCode } = {}
  } = data || {};
  const token = TokenManager.getAccessToken();
  const { visitorId } = useVisitor();
  const { user, isLoggedIn } = useAuthStore((state) => state);
  const [applyCoupon, { loading }] = useMutation(APPLY_CART_COUPON);
  const [removeCoupon, { loading: removeLoading }] = useMutation(REMOVE_CART_COUPON);

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
    if (loading) return;
    try {
      const input = {
        ...(isLoggedIn && token ? { token } : {}),
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
        couponCode: data?.couponCode || null,
      };
      const { data: response } = await applyCoupon({
        variables: { ...input },
      });
      const { _id } = response?.applyCartCoupon || {};
      if (_id) {
        // reset(); // Don't reset, let it persist
        await refetch();
        toast.success("Coupon Applied successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to apply coupon");
      reset();
    }
  };

  const onRemoveCoupon = async () => {
    if (removeLoading) return;
    try {
      const variables = {
        ...(isLoggedIn && token ? { token } : {}),
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };
      await removeCoupon({ variables });
      await refetch();
      toast.success("Coupon removed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to remove coupon");
    }
  };
  return (
    <div className="final-checkout-cont">
      <div className="checkout-t">Order Summary ({itemcount})</div>

      <div className="checkout-items-cont">
        {cart &&
          cart?.map((item, index) => {
            const price = item?.variantDetail?.variantPrice || null;
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
                    {renderVariants(item?.product?.productOptions || [], item?.variantDetail?.selectedOptions || [])}
                  </div>
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
          disabled={loading || isCouponApplied}
          {...register("couponCode")}
          onChange={(e) => {
            let value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
            value = value.toUpperCase();
            e.target.value = value;
          }}
        />
        {isCouponApplied ? (
          <button
            className="_btn_wrapper _btn_height _w-full RemoveBtn"
            onClick={onRemoveCoupon}
            disabled={removeLoading}
            style={{ backgroundColor: "#ff4d4d", color: "white" }}
          >
            {removeLoading ? "Removing..." : "Remove"}
          </button>
        ) : (
          <button
            className="_btn_wrapper _btn_height _w-full ApplyBtn"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        )}
      </div>
      {errors.couponCode && (
        <span className="error-text">{errors.couponCode.message}</span>
      )}
      <div className="checkout-price-cont">
        <div className="cpp">
          Subtotal:
          {!totalprice ? (
            // <FinalpriceLoader2 />
            <></>
          ) : (
            <div className="cpp-p"> &#8377; {data?.pricesIncludeTax ? (totalprice - (data?.totalTax || 0)).toFixed(2) : totalprice}</div>
          )}
        </div>
        {totalDiscount > 0 && (
          <div className="cpp">
            Discount:
            <div className="cpp-p">
              {`- ${String.fromCharCode(8377)} ${totalDiscount}`}

            </div>
          </div>
        )}
        <div className="cpp">
          Shipping:
          <div className="cpp-p">
            {isFreeShippingEnabled ? "Free" : `${String.fromCharCode(8377)} 0.0`}
          </div>
        </div>

        {data?.taxBreakdown?.length > 0 && (
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
        Total:
        {!discountedPrice ? (
          //   <FinalpriceLoader2 />
          <></>
        ) : (
          <div className="checkout-price">&#8377; {discountedPrice}</div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
