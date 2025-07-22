import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import OutsideClickHandler from "react-outside-click-handler";
import { RxCross2 } from "react-icons/rx";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";

const CartDrawer = () => {
  const { isCartOpen, closeCart, cart } = useCartStore();
  const count = cart.length;
  return (
    <>
      <div
        className={
          isCartOpen
            ? "Modal_wrapper pointEventall"
            : "Modal_wrapper pointEventnone"
        }
      >
        <div
          className={
            isCartOpen
              ? "Modal_Overlay Modal_bgClr Modal_content"
              : "Modal_Overlay Modal_content"
          }
        >
          <OutsideClickHandler onOutsideClick={closeCart}>
            <div
              className={
                isCartOpen
                  ? "ReactModal__Content translateCart"
                  : "ReactModal__Content"
              }
            >
              <div className="ReactModal__Content_cntr">
                <div className="ReactModal__Content_Drawer">
                  <div className="ReactModal_Drawer_inner">
                    <div className="ReactModal_Drawer_inner_top">
                      <h1>
                        Bag <sup>({count})</sup>
                      </h1>
                      <button className="Modal_cancel_btn" onClick={closeCart}>
                        <RxCross2 />
                      </button>
                    </div>
                    {/* <div style={{ overflow: "auto" }} data-lenis-prevent>
                      {cart && cart.length > 0 ? (
                        <>
                          {cart.map((item, i) => {
                            const price = prices[i];
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
                                        <img src={item.img} alt="image" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="ReactModal_Drawer_center_content">
                                  <div className="Modal_Drawer_center_content_lft">
                                    <div className="Modal_center_lft_top">
                                      <h2 className="Modal_item_name">
                                        {item.name}
                                      </h2>
                                      <div>
                                        {Object.keys(item.variants[0]).map(
                                          (el, j, array) => (
                                            <span key={el} className="">
                                              {item.variants[0][el]}
                                              {j !== array.length - 1 && " / "}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    <div className="Modal_center_lft_Qunty">
                                      <span>Quantity</span>
                                      <button
                                        className="cart_Quantity_btn"
                                        onClick={() => {
                                          dispatch(
                                            editqty({
                                              id: item.productid,
                                              work: -1,
                                            })
                                          );
                                        }}
                                      >
                                        <FiMinus />
                                      </button>
                                      <span className="cart_Quantity_number">
                                        {item.qty}
                                      </span>
                                      <button
                                        className="cart_Quantity_btn"
                                        onClick={() => {
                                          dispatch(
                                            editqty({
                                              id: item.productid,
                                              work: 1,
                                            })
                                          );
                                        }}
                                      >
                                        <FiPlus />
                                      </button>
                                    </div>
                                    <button
                                      className="Modal_remove_btn"
                                      onClick={() => {
                                        dispatch(
                                          editqty({
                                            id: item.productid,
                                            work: -2,
                                          })
                                        );
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="Modal_Drawer_center_content_ryt">
                                    <div className="cmn_style Modal_Drawer_center_content_ryt_price">
                                      <div className="Modal_Drawer_center_content_ryt_price_cntr"></div>
                                      {!price ? (
                                        <></>
                                      ) : (
                                        <span>{price * item.qty}</span>
                                      )}

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
                    </div> */}
                    <div className="Modal_drawer_checkout_wrap">
                      <dl className="cmn_style Modal_drawer_checkout_wrap_top">
                        <dt>Total</dt>
                        {/* <dd className="Modal_drawer_cross_price">
                                <span>₹1,795.00</span>
                              </dd> */}
                        <dd className="Modal_drawer_main_price">
                          {/* <div>{totalAmount} INR</div> */}
                        </dd>
                      </dl>
                      <div className="cmn_style Modal_drawer_checkout_wrap_btm">
                        <span>
                          Free worldwide shipping on orders over 500 INR
                        </span>
                        {/* <div style={{ position: "relative" }}>
                          <button
                            className="_btn_wrapper"
                            style={
                              btnLoading
                                ? { backgroundColor: "black", width: "100%" }
                                : { width: "100%" }
                            }
                            onClick={() => {
                              setBtnLoading(true);
                              setTimeout(() => {
                                router.push("/checkout");
                                setModalIsOpen(false);
                              }, 2000);
                            }}
                          >
                            {btnLoading ? (
                              <div className="ani-wrap">
                                <div className="ani-main"></div>
                              </div>
                            ) : (
                              <>Checkout</>
                            )}
                          </button>
                        </div> */}
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
