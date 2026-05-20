import React, { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_ITEM_TO_CART, CART_LIST, REMOVE_ITEM_FROM_CART } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { formatePrice, getCartItemCount } from "@/utils/Util";
import gsap from "gsap";
import CartProduct from "@/components/cart/CartProduct";
import CartEmptyState from "@/components/cart/CartEmptyState";
import NoiseOverlay from "@/components/common/NoiseOverlay";
import CommonButton from "../common/CommonButton";
import { TokenManager } from "@/utils/tokenManager";

const CartDrawer = ({ isOpen, closeCart }) => {
  const router = useRouter();
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const token = TokenManager.getAccessToken();
  const { visitorId } = useVisitor();
  const { user, isLoggedIn } = useAuthStore((state) => state);

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
    skip: !isOpen || (!isLoggedIn && !visitorId),
    variables: cartListPayload,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  const {
    _id,
    totalprice = 0,
    discountedPrice = 0,
    cart = [],
  } = cartResponse?.getCart || {};

  const count = getCartItemCount(cart);
  const isEmpty = !cart?.length;
  const handleAddItem = async (productId, variantDetail, categoryId) => {
    try {
      const { __typename, ...variantWithoutTypename } = variantDetail;
      const payload = {
        input: {
          productId,
          categoryId,
          variantDetail: variantWithoutTypename,
          ...(isLoggedIn && token ? { token } : {}),
        },
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };

      const { data: response } = await addCartItem({ variables: payload });
      const message = response?.addItemToCart;
      if (!message) return;
      toast.success(message || "Item added successfully!");
      await refetch();
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
      const message = response?.removeItemFromCart;
      if (!message) return;
      toast.success(message || "Item removed successfully!");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to remove item from cart");
    }
  };

  const navigateCheckout = async () => {
    try {
      setIsBtnLoading(true);
      router.push(`/checkout/${_id}`);
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
  }, [isOpen]);

  return (
    <div id="card_drawer" onClick={closeCart} ref={backdropRef}>
      <div id="drawer" onClick={(e) => e.stopPropagation()} ref={drawerRef}>
        <NoiseOverlay className="noise--drawer" />
        <div id="drawer_header">
          <span>
            Bag <sup>({count})</sup>
          </span>
          <button id="close" onClick={closeCart}>
            <RxCross2 />
          </button>
        </div>

        <div
          id="drawer_products"
          className={isEmpty ? "is-empty" : ""}
          data-lenis-prevent
        >
          {!isEmpty ? (
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
            <CartEmptyState active={isOpen} />
          )}
        </div>

        {!isEmpty && (
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
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
