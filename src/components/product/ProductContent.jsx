import React, { useEffect, useState, useMemo, useRef } from "react";
import { htmlParser } from "@/utils/Util";
import { Const, StockStatus } from "@/utils/Constant";
import gsap from "gsap";
import CommonButton from "@/components/common/CommonButton";

const ProductContent = ({
  data = {},
  finalPrice,
  loading,
  notifyLoading,
  isOutOfStock,
  cartBtn,
  setFinalPrice,
  setVariantMatched,
  setCartBtn,
  handleOpen,
  handleAddToCart,
  handleNotifyMe,
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
    if (!data?.productOptions?.length) return;

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
    const selectedValues = Object.values(updatedVariants).sort();

    const matchingVariant = data?.variants?.find((variant) => {
      const options = variant.selectedOptions?.sort();
      return (
        options?.length === selectedValues.length &&
        options.every((val, i) => val === selectedValues[i])
      );
    });

    if (matchingVariant) {
      const variantPrice = matchingVariant.variantPrice || 0;
      const { __typename, _id, ...variantWithoutTypename } = matchingVariant;
      setVariantMatched({ variantDetailId: _id, ...variantWithoutTypename });
      setFinalPrice(variantPrice);
    }
  };

  const handleVariants = (name, value) => {
    const updated = { ...selectedVariants, [name]: value };
    setSelectedVariants(updated);
    setCartBtn(Object.keys(updated).length === data.productOptions?.length);
    updatePriceBasedOnVariant(updated);
  };

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
  }, [data]);

  const addToBagTitle = !cartBtn
    ? "Select a Size"
    : isOutOfStock
      ? StockStatus.OUT_OF_STOCK
      : "Add to Bag";

  if (!data) return null;
  return (
    <div className="ProductDets_text_wrapper" ref={wrapperRef}>
      <div className="ProductDets_blank-div">
        <div className="ProductDets_text-container">
          <div className="ProductDets_text_container_resp">
            <h1 className="ProductDets_text_container_resp_productName ProductDets_common_style">
              {data.name}
            </h1>
            <div className="ProductDets_text_container_price_resp_flex ProductDets_common_style product-detail-price-header">
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
                  return (
                    <div
                      key={i}
                      aria-label={choice.name}
                      onClick={() => {
                        handleVariants(colorOption.optionName, choice.name);
                      }}
                      className={`shop-card_grid collection_grid ${selected ? "Product_active_color" : ""
                        }`}
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
                      return (
                        <div
                          key={j}
                          onClick={() => {
                            handleVariants(
                              productOption.optionName,
                              choice.name
                            );
                          }}
                          className={`ProductDets-size_numbers ${selected ? "acitve" : ""
                            }`}
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

          <div className="ProductDets_Notify_wrap desktop_add_btn product-detail-actions">
            <CommonButton
              type="button"
              onClick={handleAddToCart}
              loading={loading}
              disabled={!cartBtn || isOutOfStock}
              useDefaultId={false}
              className="product-detail-cta product-detail-cta--full"
            >
              <span className="product-detail-cta__label">{addToBagTitle}</span>
              {cartBtn ? (
                <span className="product-detail-cta__price">
                  {finalPrice} INR
                </span>
              ) : null}
            </CommonButton>
            {isOutOfStock && (
              <CommonButton
                type="button"
                title="Notify me"
                onClick={handleNotifyMe}
                loading={notifyLoading}
                useDefaultId={false}
                className="product-detail-cta"
              />
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
