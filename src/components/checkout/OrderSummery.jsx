import React from "react";
import z from "zod";
import { renderVariants } from "@/utils/Util";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APPLY_CART_COUPON } from "@/graphql";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth-store";
import { AuthCookies } from "@/utils/AuthCookies";
import { useVisitor } from "@/hooks/useVisitor";

const couponSchema = z.object({ couponCode: z.string().min(1, "Current password is required") });
const OrderSummery = ({ data, refetch }) => {
  const {
    totalprice = 0,
    itemcount = 0,
    isFreeShippingEnabled = false,
    discountedPrice = 0,
    totalDiscount = 0,
    cart = [],
    coupon: { couponId: isCouponApplied } = {}
  } = data || {};
  const token = AuthCookies.get();
  const { visitorId } = useVisitor();
  const { user, isLoggedIn } = useAuthStore((state) => state);
  const [applyCoupon, { loading }] = useMutation(APPLY_CART_COUPON);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(couponSchema),
  });

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
        reset();
        await refetch();
        toast.success("Coupon Applied successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to apply coupon");
      reset();
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
      {!isCouponApplied && (
        <div className={`promo-cont t3`}>
          <input
            type="text"
            className="promo-input"
            placeholder="Discount Code or Gift Card"
            disabled={loading}
            {...register("couponCode")}
            onChange={(e) => {
              let value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
              value = value.toUpperCase();
              e.target.value = value;
            }}
          />
          <button className="_btn_wrapper _btn_height _w-full ApplyBtn" onClick={handleSubmit(onSubmit)}>
            Apply
          </button>
        </div>
      )}
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
            <div className="cpp-p"> &#8377; {totalprice}</div>
          )}
        </div>
        {totalDiscount && (
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
            {isFreeShippingEnabled ? `${String.fromCharCode(8377)} 0.0` : "Free"}

          </div>
        </div>
        <div className="cpp">
          Taxes:
          <div className="cpp-p"> &#8377; {0.0}</div>
        </div>
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

export default OrderSummery;
