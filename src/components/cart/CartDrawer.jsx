import React, { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import { useRouter } from "next/router";
import { RxCross2 } from "react-icons/rx";
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_ITEM_TO_CART, CART_LIST, REMOVE_ITEM_FROM_CART } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { formatePrice, getCartItemCount } from "@/utils/Util";
import gsap from "gsap";
import CartProduct from "@/components/cart/CartProduct";
import CommonButton from "../common/CommonButton";
import {
  getErrorMessage,
  isInvalidGuestIdError,
} from "@/utils/api-error.util";
import { getLoginPath } from "@/utils/redirect.util";
import { CtaEnum, trackCtaClick } from "@/utils/analytics-events.util";

const CartDrawer = ({ isOpen, closeCart }) => {
  const router = useRouter();
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const { visitorId, resetVisitorId } = useVisitor();
  const { isLoggedIn } = useAuthStore((state) => state);

  const [isBtnLoading, setIsBtnLoading] = useState(false);

  const [addCartItem, { loading: itemAddLoader }] =
    useMutation(ADD_ITEM_TO_CART);
  const [removeCartItem, { loading: itemRemoveLoader }] = useMutation(
    REMOVE_ITEM_FROM_CART
  );

  // Customers are identified by their token; guests by the server-issued
  // guest id (R2-C2).
  const cartListPayload = isLoggedIn
    ? {}
    : visitorId
      ? { guestId: visitorId }
      : {};

  const {
    data: cartResponse,
    loading,
    error: cartError,
    refetch,
  } = useQuery(CART_LIST, {
    skip: !isOpen || (!isLoggedIn && !visitorId),
    variables: cartListPayload,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  // A rejected guest id has no cart: drop it; the next add issues a new one.
  useEffect(() => {
    if (!isLoggedIn && isInvalidGuestIdError(cartError)) resetVisitorId();
  }, [cartError, isLoggedIn, resetVisitorId]);

  const handleGuestError = (err) => {
    if (!isLoggedIn && isInvalidGuestIdError(err)) resetVisitorId();
  };

  const {
    _id,
    totalprice = 0,
    discountedPrice = 0,
    cart = [],
  } = cartResponse?.getCart || {};

  const count = getCartItemCount(cart);
  const handleAddItem = async (productId, variantId) => {
    try {
      const payload = {
        input: { productId, variantId, qty: 1 },
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };

      const { data: response } = await addCartItem({ variables: payload });
      const message = response?.addItemToCart;
      if (!message) return;
      toast.success(message || "Item added successfully!");
      await refetch();
    } catch (err) {
      console.error(err);
      handleGuestError(err);
      toast.error(getErrorMessage(err, "Failed to add item in cart"));
    }
  };

  const handleRemoveItem = async (
    productId,
    variantId,
    isCompleteRemove = true
  ) => {
    try {
      const input = {
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
        productId,
        variantId,
        isCompleteRemove,
      };
      const { data: response } = await removeCartItem({ variables: { input } });
      const message = response?.removeItemFromCart;
      if (!message) return;
      toast.success(message || "Item removed successfully!");
      await refetch();
    } catch (err) {
      console.error(err);
      handleGuestError(err);
      toast.error(getErrorMessage(err, "Failed to remove item from cart"));
    }
  };

  const navigateCheckout = async () => {
    if (!_id || cart.length === 0) return;
    trackCtaClick(CtaEnum.CHECKOUT);
    try {
      setIsBtnLoading(true);
      // Checkout is customer-only; guests log in first (the guest bag is
      // merged into the customer bag at login).
      await router.push(
        isLoggedIn ? `/checkout/${_id}` : getLoginPath(router.asPath),
      );
      closeCart();
    } catch (err) {
      console.error("Navigation failed:", err);
    } finally {
      setIsBtnLoading(false);
    }
  };

  // Drawer animation
  useEffect(() => {
    const tl = gsap.timeline();
    if (isOpen) {
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

    return () => tl.kill();
  }, [isOpen]);

  return (
    <div id="card_drawer" onClick={closeCart} ref={backdropRef}>
      <div id="drawer" onClick={(e) => e.stopPropagation()} ref={drawerRef}>
        <div id="drawer_header">
          <span>
            Bag <sup>({count})</sup>
          </span>
          <button id="close" onClick={closeCart}>
            <RxCross2 />
          </button>
        </div>

        <div id="drawer_products" data-lenis-prevent>
          {cart?.length > 0 ? (
            cart.map((item, i) => (
              <CartProduct
                key={`cart-product-item-${i}`}
                index={i}
                item={item}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
              />
            ))
          ) : (
            <span id="no_item">There are currently no items in your bag.</span>
          )}
        </div>

        <div id="drawer_bottom">
          <div className="total_price">
            <span>Total</span>
            {totalprice !== discountedPrice && (
              <span>{formatePrice(totalprice)}</span>
            )}
            <span>{formatePrice(discountedPrice)}</span>
          </div>
          <div className="checkout_btn_container">
            <span>
              Our outfits are made to order! The delivery time for our products
              is approx. 2 weeks
            </span>
            <CommonButton
              title={"Checkout"}
              onClick={navigateCheckout}
              loading={isBtnLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
