import React, { useState } from "react";
import toast from "react-hot-toast";
import OutsideClickHandler from "react-outside-click-handler";
import { useRouter } from "next/router";
import { RxCross2 } from "react-icons/rx";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_ITEM_TO_CART, CART_LIST, REMOVE_ITEM_FROM_CART } from "@/graphql";
import { useAuthStore } from "@/store/AuthStore";
import { useVisitor } from "@/hooks/useVisitor";
const CartDrawer = ({ isOpen, closeCart }) => {
  const router = useRouter();
  const { visitorId } = useVisitor();
  const { token, user, isLoggedIn } = useAuthStore();
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

  if (loading) return;
  return (
    <>
      <div
        className={
          isOpen
            ? "Modal_wrapper pointEventall"
            : "Modal_wrapper pointEventnone"
        }
      >
        <div
          className={
            isOpen
              ? "Modal_Overlay Modal_bgClr Modal_content"
              : "Modal_Overlay Modal_content"
          }
        >
          <OutsideClickHandler onOutsideClick={closeCart}>
            <div
              className={
                isOpen
                  ? "ReactModal__Content translateCart"
                  : "ReactModal__Content"
              }
            >
              <div className="ReactModal__Content_cntr">
                <div className="ReactModal__Content_Drawer">
                  <div className="ReactModal_Drawer_inner">
                    <div className="ReactModal_Drawer_inner_top">
                      <h1>
                        Bag <sup>({itemcount})</sup>
                      </h1>
                      <button className="Modal_cancel_btn" onClick={closeCart}>
                        <RxCross2 />
                      </button>
                    </div>
                    <div style={{ overflow: "auto" }} data-lenis-prevent>
                      {cart && cart.length > 0 ? (
                        <>
                          {cart.map((item, i) => {
                            return (
                              <div
                                className="ReactModal_Drawer_center"
                                key={`item-${i}`}
                              >
                                <div
                                  className="Modal_Drawer_img_cntr"
                                  aria-current="page"
                                >
                                  <div className="Modal_drawer_img_wrap">
                                    <div className="Modal_drawer_img_wrap_grid">
                                      <div className="Modal_Drawer_img_grid_cover">
                                        <img
                                          src={item?.asset?.path || ""}
                                          alt={item?.asset?.altText || ""}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="ReactModal_Drawer_center_content">
                                  <div className="Modal_Drawer_center_content_lft">
                                    <div className="Modal_center_lft_top">
                                      <h2 className="Modal_item_name">
                                        {item?.name || ""}
                                      </h2>
                                      <div>
                                        {renderVariants(
                                          item?.variantDetail
                                            ?.selectedOptions || []
                                        )}
                                      </div>
                                    </div>
                                    <div className="Modal_center_lft_Qunty">
                                      <span>Quantity</span>
                                      <button
                                        disabled={itemRemoveLoader}
                                        className="cart_Quantity_btn"
                                        onClick={() =>
                                          handleRemoveItem(
                                            item?.productId || null,
                                            item?.variantDetail
                                              ?.variantDetailId || null,
                                            false
                                          )
                                        }
                                      >
                                        <FiMinus />
                                      </button>
                                      <span className="cart_Quantity_number">
                                        {item.qty}
                                      </span>
                                      <button
                                        disabled={itemAddLoader}
                                        className="cart_Quantity_btn"
                                        onClick={() =>
                                          handleAddItem(
                                            item?.productId || null,
                                            item?.variantDetail || {}
                                          )
                                        }
                                      >
                                        <FiPlus />
                                      </button>
                                    </div>
                                    <button
                                      disabled={itemRemoveLoader}
                                      className="Modal_remove_btn"
                                      onClick={() =>
                                        handleRemoveItem(
                                          item?.productId || null,
                                          item?.variantDetail
                                            ?.variantDetailId || null
                                        )
                                      }
                                    >
                                      {itemRemoveLoader
                                        ? "Removing..."
                                        : "Remove"}
                                    </button>
                                  </div>
                                  <div className="Modal_Drawer_center_content_ryt">
                                    <div className="cmn_style Modal_Drawer_center_content_ryt_price">
                                      <div className="Modal_Drawer_center_content_ryt_price_cntr"></div>
                                      <span>
                                        {item?.variantDetail?.variantPrice || 0}
                                      </span>
                                      <span>&nbsp;INR</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          <div>
                            <h1 className="no-item">
                              There are currently no items in your bag.
                            </h1>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="Modal_drawer_checkout_wrap">
                      <div className="cmn_style Modal_drawer_checkout_wrap_top">
                        <div>Total</div>
                        {totalprice !== discountedPrice && (
                          <div className="Modal_drawer_cross_price">
                            <span>{totalprice}</span>
                          </div>
                        )}
                        <div className="Modal_drawer_main_price">
                          <div>{discountedPrice} INR</div>
                        </div>
                      </div>
                      <div className="cmn_style Modal_drawer_checkout_wrap_btm">
                        <span>
                          Free worldwide shipping on orders over 500 INR
                        </span>
                        <div style={{ position: "relative" }}>
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
                </div>
              </div>
            </div>
          </OutsideClickHandler>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
