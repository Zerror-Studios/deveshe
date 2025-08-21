import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { RxCross2 } from "react-icons/rx";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_ITEM_TO_CART, CART_LIST, REMOVE_ITEM_FROM_CART } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { formatePrice } from "@/utils/Util";
import gsap from "gsap";
import CartProduct from "./CartProduct";
const CartDrawer = ({ isOpen, closeCart }) => {
  const router = useRouter();
  const { visitorId } = useVisitor();
  const { token, user, isLoggedIn } = useAuthStore((state) => state);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [addCartItem, { loading: itemAddLoader }] =
    useMutation(ADD_ITEM_TO_CART);
  const [removeCartItem, { loading: itemRemoveLoader }] = useMutation(
    REMOVE_ITEM_FROM_CART
  );
  const cartListPayload = isLoggedIn
    ? { token }
    : visitorId
    ? { guestId: visitorId }
    : {};
  const {
    data: cartResponse,
    loading,
    refetch,
  } = useQuery(CART_LIST, {
    skip: !isOpen,
    variables: cartListPayload,
  });

  const {
    _id,
    itemcount = 0,
    totalprice = 0,
    discountedPrice = 0,
    cart = [],
  } = cartResponse?.getCart || {};

  const renderVariants = (variant) =>
    variant.map((value, idx) => (
      <span key={idx}>
        {value}
        {idx < variant.length - 1 && " / "}
      </span>
    ));

  const handleAddItem = async (productId, variantDetail) => {
    try {
      const { __typename, ...variantWithoutTypename } = variantDetail;
      const payload = {
        input: {
          productId,
          variantDetail: variantWithoutTypename,
          ...(isLoggedIn && token ? { token } : {}),
        },
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };

      const { data: response } = await addCartItem({ variables: payload });
      const message = response?.addItemToCart || null;
      if (!message) return;
      toast.success(message || "Item added successfully!");
      refetch(cartListPayload);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add item in cart");
    }
  };

  const handleRemoveItem = async (
    productId,
    variantDetailId,
    isCompleteRemove = true
  ) => {
    try {
      const input = {
        ...(isLoggedIn && token ? { userId: user?._id } : {}),
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
        productId,
        variantDetailId,
        isCompleteRemove,
      };
      const { data: response } = await removeCartItem({ variables: { input } });
      const message = response?.removeItemFromCart || null;
      if (!message) return;
      toast.success(message || "Item removed successfully!");
      refetch(cartListPayload);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to remove item form cart");
    }
  };

  const navigateCheckout = () => {
    setIsBtnLoading(true);
    setTimeout(() => {
      closeCart();
      router.push("/checkout/" + _id);
    }, 1000);
    setIsBtnLoading(false);
  };
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      var tl = gsap.timeline();

      tl.to(backdropRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.2,
      }).to(drawerRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      var tl = gsap.timeline();
      tl.to(drawerRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power3.in",
      }).to(backdropRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.3,
      });
    }
  }, [isOpen]);

  return (
    <div id="card_drawer" onClick={closeCart} ref={backdropRef}>
      <div id="drawer" onClick={(e) => e.stopPropagation()} ref={drawerRef}>
        <div id="drawer_header">
          <span>
            Bag <sup>({itemcount})</sup>
          </span>
          <button id="close" onClick={closeCart}>
            <RxCross2 />
          </button>
        </div>
        <div id="drawer_products" data-lenis-prevent>
          {cart && cart.length > 0 ? (
            <>
              {cart.map((item, i) => {
                return (
                  <CartProduct
                    key={`item-${i}`}
                    item={item}
                    renderVariants={renderVariants}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                    itemAddLoader={itemAddLoader}
                    itemRemoveLoader={itemRemoveLoader}
                  />
                );
              })}
            </>
          ) : (
            <span id="no_item">There are currently no items in your bag.</span>
          )}
        </div>
        <div id="drawer_bottom">
          <div className="total_price">
            <span>Total</span>
            {totalprice !== discountedPrice && (
              <span>{formatePrice(totalprice || "")}</span>
            )}
            <span>{formatePrice(discountedPrice || "")}</span>
          </div>
          <div className="checkout_btn_container">
            <span>Free worldwide shipping on orders over 500 INR</span>
            <button
              className="_btn_wrapper"
              style={
                isBtnLoading
                  ? { backgroundColor: "black", width: "100%" }
                  : { width: "100%" }
              }
              onClick={navigateCheckout}
            >
              {isBtnLoading ? (
                <div className="ani-wrap">
                  <div className="ani-main"></div>
                </div>
              ) : (
                <>Checkout</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
