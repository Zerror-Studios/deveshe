import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { htmlParser } from "@/utils/Util";

const ProductContent = ({ data = {} }) => {
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantSelect, setVariantSelect] = useState({});
  const [colorSelect, setColorSelect] = useState(null);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [cartBtn, setCartBtn] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const basePrice =
    data?.discountedPrice > 0 ? data.discountedPrice : data.price;

  useEffect(() => {
    if (data) {
      setFinalPrice(basePrice);

      // Default variant selection
      const defaults = {};
      data.productOptions?.forEach((option) => {
        if (option.choices?.length > 0) {
          defaults[option.optionName] = option.choices[0].name;
        }
      });
      setSelectedVariants(defaults);

      // Default color selection index
      const colorOption = data.productOptions?.find(
        (option) => option.showInProductPageAs === "Color"
      );
      if (colorOption?.choices?.length > 0) {
        setColorSelect(0);
      }

      // Enable cart button if default selections cover all options
      setCartBtn(Object.keys(defaults).length === data.productOptions?.length);
    }
  }, [data]);

  const updatePriceBasedOnVariant = (updatedVariants) => {
    const matchingVariant = data?.variants?.find((variant) =>
      variant.selectedOptions?.every((option) =>
        Object.entries(option).every(
          ([key, val]) => updatedVariants[key] === val
        )
      )
    );

    if (matchingVariant) {
      const diff = matchingVariant.priceDifference || 0;
      setFinalPrice(basePrice + diff);
    }
  };

  const handleVariants = (name, value) => {
    const updatedVariants = { ...selectedVariants, [name]: value };
    setSelectedVariants(updatedVariants);

    // Update UI state
    setCartBtn(
      Object.keys(updatedVariants).length === data.productOptions?.length
    );
    updatePriceBasedOnVariant(updatedVariants);
  };

  const handleVariantSelection = (variantTitle, option, index) => {
    setVariantSelect((prev) => ({
      ...prev,
      [variantTitle]: `${variantTitle}-${index}`,
    }));
  };

  const handleAddToCart = () => {
    if (!cartBtn) return;

    setIsBtnLoading(true);
    setTimeout(() => {
      setIsBtnLoading(false);
    }, 500);

    addToCart({
      name: data.name,
      img: data.assets?.[0]?.path || "",
      productid: data._id,
      qty: 1,
      variants: selectedVariants,
    });
  };

  return (
    <div className="ProductDets_text_wrapper">
      <div className="ProductDets_blank-div">
        <div className="ProductDets_text-container">
          <div className="ProductDets_text_container_resp">
            <div>
              <h1 className="ProductDets_text_container_resp_productName ProductDets_common_style">
                {data?.name ?? ""}
              </h1>
            </div>
            <div className="ProductDets_text_container_price_resp ProductDets_common_style">
              <div className="ProductDets_text_container_price_resp_flex">
                <span>{finalPrice}</span>
                <span>&nbsp;INR</span>
              </div>
            </div>
          </div>
          <div className="ProductDets_title_wrap">
            <h1 className="ProductDets_text_container_productName ProductDets_common_style">
              {data?.name || ""}
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
            <div className="ProductDets_Variants">
              <div className="ProductDets_collection-wrap">
                <fieldset className="ProfuctDets_fieldset">
                  {data &&
                    data.productOptions &&
                    data.productOptions.length > 0 &&
                    data.productOptions
                      .filter(
                        (option) => option.showInProductPageAs === "Color"
                      )
                      .map((colorOption) =>
                        colorOption.choices.map((choice, i) => (
                          <div
                            aria-label={choice.name}
                            onClick={() => {
                              setColorSelect(i);
                              handleVariants(
                                colorOption.optionName,
                                choice.name
                              );
                            }}
                            className={
                              colorSelect == i
                                ? "shop-card_grid collection_grid Product_active_color"
                                : "shop-card_grid collection_grid"
                            }
                            key={i}
                          >
                            <div className="ProductDets_collection_imgs_grid_cntr">
                              <div className="ProductDets_imgs_grid_cntr ProductDets_imgs_grid_cntr2">
                                <div className="ProductDets_collection_img_cntr">
                                  <div
                                    className="Product_color"
                                    style={{
                                      backgroundColor: choice.name,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                </fieldset>
              </div>
              <div className="ProductDets-size_assist_cntr">
                <div id="easysize_button" className="easysize_button">
                  {data &&
                    data.productOptions &&
                    data.productOptions.length > 0 &&
                    data.productOptions
                      .filter(
                        (option) => option.showInProductPageAs === "Color"
                      )
                      .map(
                        (colorOption) =>
                          colorOption.choices[colorSelect]?.name ||
                          colorOption.choices[0]?.name
                      )}
                </div>
              </div>
            </div>
            <div className="ProductDets_size_Mainwrap">
              {data &&
                data.productOptions &&
                data.productOptions.length > 0 &&
                data.productOptions
                  .filter((option) => option.showInProductPageAs === "List")
                  .map((productOption, i) => (
                    <div
                      className="ProductDets_size_wrap"
                      key={`productOption-${i}`}
                    >
                      <div className="ProductDets-size_numbers_cntr">
                        <div
                          className="ProductDets-size_numbers_inner"
                          id="easysize-size-selector"
                        >
                          {productOption.choices &&
                            productOption.choices.map((choice, j) => (
                              <div
                                key={`choice-${j}`}
                                onClick={() => {
                                  handleVariants(
                                    productOption.optionName,
                                    choice.name
                                  );
                                  handleVariantSelection(
                                    productOption.optionName,
                                    choice.name,
                                    j
                                  );
                                }}
                                aria-current="page"
                                className={
                                  variantSelect[productOption.optionName] ==
                                  `${productOption.optionName}-${j}`
                                    ? "ProductDets-size_numbers acitve"
                                    : "ProductDets-size_numbers"
                                }
                              >
                                {choice.name}
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="ProductDets-size_assist_cntr">
                        <div
                          id="easysize_button"
                          className="easysize_button"
                          style={{ textTransform: "capitalize" }}
                        >
                          {productOption.optionName} Assistance
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="ProductDets_Notify_wrap">
            <button
              className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
              id="easysize-cart-button"
              style={isBtnLoading ? { backgroundColor: "black" } : {}}
              onClick={handleAddToCart}
            >
              {isBtnLoading ? (
                <>
                  <div className="ani-wrap">
                    <div className="ani-main"></div>
                  </div>
                </>
              ) : (
                <>
                  {!cartBtn ? (
                    <span className="ProductDets_ntfy_btn_slect_size">
                      Select a Size
                    </span>
                  ) : (
                    <span className="ProductDets_ntfy_btn_slect_size">
                      Add to Bag
                    </span>
                  )}
                  <span className="ProductDets_ntfy_btn_AddtoBeg">
                    Add to Bag
                  </span>

                  <div className="ProductDets_ntfy_btn_price">
                    <div className="">
                      <span>{finalPrice}</span>
                      <span>&nbsp;INR</span>
                    </div>
                  </div>
                </>
              )}
            </button>

            {/* <AnimBtn btnLoading={btnLoading} /> */}
          </div>

          <div className="ProductDets_bottom_links_wrap">
            <div className="ProductDets_info_links">
              <button className="ProductDets_info-btn">Details</button>
              <button className="ProductDets_info-btn">Care</button>
              <button className="ProductDets_info-btn">Shipping</button>
              <button className="ProductDets_info-btn">Help</button>
            </div>
            <div className="ProductDets_info_help">
              <p className="ProductDets_info_text sql38zc _1l9nr81o">
                Complimentary shipping on orders above 500 EUR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductContent;
