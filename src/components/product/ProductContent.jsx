import React, { useEffect, useState, useMemo, useRef } from "react";
import { htmlParser } from "@/utils/Util";
import { StockStatus } from "@/utils/Constant";
import {
  findVariantByOptions,
  isVariantUnavailable,
} from "@/utils/catalog.util";
import {
  CtaEnum,
  getAnalyticsItemId,
  trackCtaClick,
  trackSelectVariant,
} from "@/utils/analytics-events.util";
import gsap from "gsap";
import {
  SOLD_OUT_LABEL,
  isChoiceSoldOut,
  resolveVariantSignal,
  toInStockFlag,
} from "@/utils/stock-signal.util";

const ProductContent = ({
  data = {},
  finalPrice,
  loading,
  notifyLoading,
  isOutOfStock,
  isSoldOut = false,
  stockNote = null,
  freshStock,
  showNotifyEmail = false,
  notifyEmail = "",
  setNotifyEmail,
  cartBtn,
  setFinalPrice,
  setVariantMatched,
  setCartBtn,
  handleOpen,
  handleAddToCart,
  handleNotifyMe,
  analyticsItemId,
}) => {
  const colorOption = useMemo(
    () =>
      data?.productOptions?.find((opt) => opt.showInProductPageAs === "Color"),
    [data]
  );

  const listOptions = useMemo(
    () =>
      data?.productOptions?.filter(
        (opt) => opt.showInProductPageAs === "List"
      ) || [],
    [data]
  );

  const [selectedVariants, setSelectedVariants] = useState({});
  // Initialize default variants and color
  useEffect(() => {
    if (!data?.productOptions?.length) {
      updatePriceBasedOnVariant({});
      setCartBtn(Boolean(data?.variants?.length === 1));
      return;
    }

    const defaults = {};
    data.productOptions.forEach((option) => {
      if (option.choices?.length) {
        defaults[option.optionName] = option.choices[0].name;
      }
    });

    setSelectedVariants(defaults);
    setCartBtn(Object.keys(defaults).length === data.productOptions.length);
    updatePriceBasedOnVariant(defaults);
  }, [data]);

  const updatePriceBasedOnVariant = (updatedVariants) => {
    const matchingVariant = findVariantByOptions(
      data?.variants,
      Object.values(updatedVariants),
    );

    if (matchingVariant) {
      setVariantMatched(matchingVariant);
      setFinalPrice(matchingVariant.price || 0);
      return matchingVariant;
    } else if (!data?.productOptions?.length && data?.variants?.length === 1) {
      // Single-variant product without options
      setVariantMatched(data.variants[0]);
      setFinalPrice(data.variants[0].price || 0);
      return data.variants[0];
    } else {
      setVariantMatched(null);
      return null;
    }
  };

  const handleVariants = (name, value) => {
    const updated = { ...selectedVariants, [name]: value };
    setSelectedVariants(updated);
    const complete =
      Object.keys(updated).length === data.productOptions?.length;
    setCartBtn(complete);
    const matched = updatePriceBasedOnVariant(updated);
    // PRD-013 select_variant: "in stock" is the PRD-020 signal when the
    // store has one, else "a variant exists and isn't ARCHIVED".
    trackSelectVariant({
      itemId: getAnalyticsItemId(data, matched),
      variantId: matched?.sku,
      variantLabel: Object.values(updated).join(" / "),
      inStock: complete
        ? toInStockFlag(
            resolveVariantSignal(matched, freshStock),
            Boolean(matched) && !isVariantUnavailable(matched),
          )
        : undefined,
    });
  };

  const handleAddToBagClick = () => {
    trackCtaClick(CtaEnum.ADD_TO_CART, { itemId: analyticsItemId });
    handleAddToCart();
  };

  const handleNotifyClick = () => {
    trackCtaClick(CtaEnum.NOTIFY_ME, { itemId: analyticsItemId });
    handleNotifyMe();
  };

  const unavailableLabel = isSoldOut ? SOLD_OUT_LABEL : StockStatus.UNAVAILABLE;
  // PRD-020 FR-13: a choice whose variants (with the other selected
  // options) are all sold out is struck through, still selectable.
  const choiceSoldOut = (optionName, choiceName) =>
    isChoiceSoldOut(
      data?.variants,
      choiceName,
      Object.entries(selectedVariants)
        .filter(([name]) => name !== optionName)
        .map(([, value]) => value),
      freshStock,
    );

  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current) return;


    // Hide everything initially
    gsap.set(wrapperRef.current, { opacity: 0, y: 30 });

    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    // Animate the wrapper
    tl.fromTo(
      wrapperRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 }
    );

    return () => tl.kill();
  }, [data]);

  if (!data) return null;
  return (
    <div className="ProductDets_text_wrapper" ref={wrapperRef}>
      <div className="ProductDets_blank-div">
        <div className="ProductDets_text-container">
          <div className="ProductDets_text_container_resp">
            <h1 className="ProductDets_text_container_resp_productName ProductDets_common_style">
              {data.name}
            </h1>
            <div className="ProductDets_text_container_price_resp_flex ProductDets_common_style">
              <span>{finalPrice} INR</span>
            </div>
          </div>

          <div className="ProductDets_title_wrap">
            <h1 className="ProductDets_text_container_productName ProductDets_common_style">
              {data.name}
            </h1>
          </div>

          <div className="ProductDets_reverse_content_wrapper">
            <div className="ProductDets_description_wrap">
              <div className="ProductDets_text-container_prdt_Desc">
                <div>{htmlParser(data?.description || "")}</div>
                <div>
                  Fits large to size, we suggest taking one size smaller than
                  usual.
                </div>
              </div>
            </div>

            {/* Color Selector */}
            {colorOption?.choices?.length > 0 && (
              <fieldset className="ProfuctDets_fieldset">
                {colorOption.choices.map((choice, i) => {
                  const selected =
                    selectedVariants[colorOption.optionName] === choice.name;
                  const soldOut = choiceSoldOut(colorOption.optionName, choice.name);
                  return (
                    <div
                      key={i}
                      aria-label={soldOut ? `${choice.name}, sold out` : choice.name}
                      onClick={() => {
                        handleVariants(colorOption.optionName, choice.name);
                      }}
                      className={`shop-card_grid collection_grid ${selected ? "Product_active_color" : ""
                        } ${soldOut ? "Product_option_sold_out" : ""}`}
                    >
                      <div className="ProductDets_collection_imgs_grid_cntr">
                        <div className="ProductDets_imgs_grid_cntr ProductDets_imgs_grid_cntr2">
                          <div className="ProductDets_collection_img_cntr">
                            <div
                              className="Product_color"
                              style={{ backgroundColor: choice.name }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </fieldset>
            )}

            {/* Size Selector */}
            {listOptions.map((productOption, i) => (
              <div className="ProductDets_size_wrap" key={`opt-${i}`}>
                <div className="ProductDets-size_numbers_cntr">
                  <div
                    className="ProductDets-size_numbers_inner"
                    id="easysize-size-selector"
                  >
                    {productOption.choices?.map((choice, j) => {
                      const selected =
                        selectedVariants[productOption.optionName] ===
                        `${choice.name}`;
                      const soldOut = choiceSoldOut(
                        productOption.optionName,
                        choice.name,
                      );
                      return (
                        <div
                          key={j}
                          onClick={() => {
                            handleVariants(
                              productOption.optionName,
                              choice.name
                            );
                          }}
                          aria-label={soldOut ? `${choice.name}, sold out` : undefined}
                          data-testid="pdp-option-choice"
                          className={`ProductDets-size_numbers ${selected ? "acitve" : ""
                            } ${soldOut ? "Product_option_sold_out" : ""}`}
                        >
                          {choice.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="ProductDets-size_assist_cntr">
                  <div
                    onClick={handleOpen}
                    className="easysize_button"
                    style={{ textTransform: "capitalize", cursor: "pointer" }}
                  >
                    {productOption.optionName} Assistance
                  </div>
                </div>
              </div>
            ))}
          </div>

          {stockNote && (
            <p className="ProductDets_stock_note">{stockNote}</p>
          )}
          {isOutOfStock && showNotifyEmail && (
            <div className="ProductDets_notify_email">
              <label htmlFor="notify-email" className="sr-only">
                Email for back-in-stock notice
              </label>
              <input
                id="notify-email"
                type="email"
                autoComplete="email"
                placeholder="Your email for a back-in-stock notice"
                value={notifyEmail}
                onChange={(event) => setNotifyEmail?.(event.target.value)}
              />
            </div>
          )}
          <div className="ProductDets_Notify_wrap desktop_add_btn">
            <button
              className={`ProductDets_ntfy_btn ${!isOutOfStock ? "ProductDets_ntfy_btn_grid" : "BtnOutline_Grid"}`}
              id="easysize-cart-button"
              data-testid="pdp-add-to-cart"
              style={loading ? { backgroundColor: "black" } : {}}
              onClick={handleAddToBagClick}
            >
              {loading ? (
                <div className="ani-wrap">
                  <div className="ani-main" />
                </div>
              ) : (
                <>
                  <span className="ProductDets_ntfy_btn_slect_size">
                    {!cartBtn ? "Select a Size" : isOutOfStock ? unavailableLabel : "Add to Bag"}
                  </span>
                  <span className="ProductDets_ntfy_btn_AddtoBeg">
                    {isOutOfStock ? unavailableLabel : "Add to Bag"}
                  </span>
                  <div className="ProductDets_ntfy_btn_price">
                    <span>{finalPrice} INR</span>
                  </div>
                </>
              )}
            </button>
            {isOutOfStock && (
              <button
                className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
                id="easysize-cart-button"
                style={notifyLoading ? { backgroundColor: "black" } : {}}
                onClick={handleNotifyClick}
              >
                {notifyLoading ? (
                  <div className="ani-wrap">
                    <div className="ani-main" />
                  </div>
                ) : (
                  <>
                    <span className="ProductDets_ntfy_btn_slect_size">
                      Notify me
                    </span>
                    <span className="ProductDets_ntfy_btn_AddtoBeg">
                      Notify me
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="ProductDets_bottom_links_wrap ProductDets_bottom_links_wrap_large">
            <div className="ProductDets_info_help">
              <p className="ProductDets_info_text sql38zc _1l9nr81o">
                Complimentary shipping on orders above 5000 INR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductContent;
