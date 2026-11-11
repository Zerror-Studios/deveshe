import React, { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_ITEM_TO_CART, CART_LIST, REMOVE_ITEM_FROM_CART } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { formatePrice, getCartItemCount } from "@/utils/Util";
import gsap from "gsap";
import CartProduct from "@/components/cart/CartProduct";
import {
  REMOVE_ITEM_OVERRIDES,
  getErrorMessage,
  getErrorReason,
  isInvalidGuestIdError,
} from "@/utils/api-error.util";
import { getLoginPath } from "@/utils/redirect.util";
import { CtaEnum, trackCtaClick } from "@/utils/analytics-events.util";
import { useVariantAvailability } from "@/hooks/useVariantAvailability";
import {
  SOLD_OUT_CHECKOUT_MESSAGE,
  getCartLineStockId,
  hasSoldOutLine,
} from "@/utils/stock-signal.util";
import CartEmptyState from "@/components/cart/CartEmptyState";
import BracketSlideCta from "@/components/common/BracketSlideCta";

const CartDrawer = ({ isOpen, closeCart }) => {
  const router = useRouter();
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const { visitorId, resetVisitorId, runWithGuestId } = useVisitor();
  const { isLoggedIn } = useAuthStore((state) => state);
  // PRD-014 UX-31: focus trap, Escape and inert-while-closed.
  useDialogA11y(drawerRef, isOpen, closeCart);

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
  const isEmpty = !cart?.length;

  // PRD-020 FR-13: a fresh stock read when the bag opens. A sold-out line
  // blocks checkout until it is removed; no signal changes nothing, and
  // checkout's own reservation stays the authority.
  const { fresh: freshStock } = useVariantAvailability(
    cart.map(getCartLineStockId),
    { skip: !isOpen },
  );
  const blockedBySoldOut = hasSoldOutLine(cart, freshStock);
  const handleAddItem = async (productId, variantId) => {
    try {
      const input = { productId, variantId, qty: 1 };

      // PRD-014 UX-37: guests re-issue a rejected id once, as on the PDP.
      const { data: response } = isLoggedIn
        ? await addCartItem({ variables: { input } })
        : await runWithGuestId((guestId) =>
          addCartItem({ variables: { input, guestId } }),
        );
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
      toast.error(
        getErrorMessage(err, "Failed to remove item from cart", REMOVE_ITEM_OVERRIDES)
      );
      // COM-32: the bag is out of date (several lines of this product).
      if (getErrorReason(err) === "VARIANT_REQUIRED") await refetch();
    }
  };

  const navigateCheckout = async () => {
    if (!_id || cart.length === 0) return;
    if (blockedBySoldOut) {
      toast.error(SOLD_OUT_CHECKOUT_MESSAGE);
      return;
    }
    trackCtaClick(CtaEnum.CHECKOUT);
    try {
      setIsBtnLoading(true);
      // Checkout is customer-only; guests log in first (the guest bag is
      // merged into the customer bag at login).
      await router.push(
        isLoggedIn
          ? `/checkout/${_id}`
          : getLoginPath(`${window.location.pathname}${window.location.search}`),
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
      <div
        id="drawer"
        onClick={(e) => e.stopPropagation()}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer_title"
        tabIndex={-1}
      >
        <div id="drawer_header">
          <span id="drawer_title">
            Bag <sup>({count})</sup>
          </span>
          <button
            type="button"
            id="close"
            onClick={closeCart}
            aria-label="Close bag"
          >
            <RxCross2 aria-hidden="true" />
          </button>
        </div>

        <div
          id="drawer_products"
          className={isEmpty ? "is-empty" : ""}
          data-lenis-prevent
        >
          {/* PRD-014 UX-37: loading and error are not "no items" */}
          {cartError && !isInvalidGuestIdError(cartError) ? (
            <div id="no_item" role="alert">
              <span>
                {getErrorMessage(cartError, "We couldn't load your bag.")}
              </span>
              <button
                type="button"
                className="cart_retry_btn"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          ) : loading && !cartResponse ? (
            <span id="no_item" role="status">
              Loading your bag…
            </span>
          ) : cart?.length > 0 ? (
            cart.map((item, i) => (
              <CartProduct
                key={`cart-product-item-${i}`}
                index={i}
                item={item}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
                freshStock={freshStock}
              />
            ))
          ) : (
            <CartEmptyState active={isOpen} />
          )}
        </div>

        {!isEmpty && (
          <div id="drawer_bottom">
            <p className="cart-delivery-note">
              Our outfits are made to order! The delivery time for our products
              is approx. 2 weeks
            </p>
            <div className="total_price">
              <span>Total</span>
              {totalprice !== discountedPrice && (
                <span>{formatePrice(totalprice)}</span>
              )}
              <span>{formatePrice(discountedPrice)}</span>
            </div>
            <div className="checkout_btn_container" data-testid="cart-checkout">
              <BracketSlideCta
                label="Checkout"
                onClick={navigateCheckout}
                loading={isBtnLoading}
                className="cart-checkout-cta"
                ariaLabel="Checkout"
              />
            </div>
            {blockedBySoldOut && (
              <span className="cart_sold_out_note" role="status">
                {SOLD_OUT_CHECKOUT_MESSAGE}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
