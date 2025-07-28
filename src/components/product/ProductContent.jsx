import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { ADD_ITEM_TO_CART } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { useVisitor } from "@/hooks/useVisitor";
import { htmlParser } from "@/utils/Util";
import { useRouter } from "next/router";

const ProductContent = ({ data = {} }) => {
  const router = useRouter();
  const { token, isLoggedIn } = useAuthStore((state) => state);
  const { visitorId } = useVisitor();

  const basePrice = useMemo(
    () => (data?.discountedPrice > 0 ? data.discountedPrice : data?.price || 0),
    [data]
  );

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

  const [finalPrice, setFinalPrice] = useState(basePrice);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantMatched, setVariantMatched] = useState(null);
  const [variantSelect, setVariantSelect] = useState({});
  const [colorSelect, setColorSelect] = useState(0);
  const [cartBtn, setCartBtn] = useState(false);
  const [addItemToCart, { loading }] = useMutation(ADD_ITEM_TO_CART);

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
    setColorSelect(0);
    setCartBtn(Object.keys(defaults).length === data.productOptions.length);
    setFinalPrice(basePrice);
  }, [data, basePrice]);

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
      const diff = matchingVariant.priceDifference || 0;
      const { __typename, _id, ...variantWithoutTypename } = matchingVariant;
      setVariantMatched({variantDetailId: _id, ...variantWithoutTypename});
      setFinalPrice(basePrice + diff);
    }
  };

  const handleVariants = (name, value) => {
    const updated = { ...selectedVariants, [name]: value };
    setSelectedVariants(updated);
    setCartBtn(Object.keys(updated).length === data.productOptions?.length);
    updatePriceBasedOnVariant(updated);
  };

  const handleAddToCart = async () => {
    if (!cartBtn) return;

    try {
      const productId = router?.query?.slug;
      if (!productId) throw new Error("Product ID not found");

      const payload = {
        input: {
          productId,
          variantDetail: variantMatched,
          ...(isLoggedIn && token ? { token } : {}),
        },
        ...(!isLoggedIn && visitorId ? { guestId: visitorId } : {}),
      };

      const { data: response } = await addItemToCart({ variables: payload });
      console.log(response);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add item to cart");
    }
  };

  if (!data) return null;

  return (
    <div className="ProductDets_text_wrapper">
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
                {colorOption.choices.map((choice, i) => (
                  <div
                    key={i}
                    aria-label={choice.name}
                    onClick={() => {
                      setColorSelect(i);
                      handleVariants(colorOption.optionName, choice.name);
                    }}
                    className={`shop-card_grid collection_grid ${
                      colorSelect === i ? "Product_active_color" : ""
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
                ))}
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
                        variantSelect[productOption.optionName] ===
                        `${productOption.optionName}-${j}`;
                      return (
                        <div
                          key={j}
                          onClick={() => {
                            handleVariants(
                              productOption.optionName,
                              choice.name
                            );
                            setVariantSelect((prev) => ({
                              ...prev,
                              [productOption.optionName]: `${productOption.optionName}-${j}`,
                            }));
                          }}
                          className={`ProductDets-size_numbers ${
                            selected ? "acitve" : ""
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
                    className="easysize_button"
                    style={{ textTransform: "capitalize" }}
                  >
                    {productOption.optionName} Assistance
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ProductDets_Notify_wrap">
            <button
              className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
              id="easysize-cart-button"
              style={loading ? { backgroundColor: "black" } : {}}
              onClick={handleAddToCart}
            >
              {loading ? (
                <div className="ani-wrap">
                  <div className="ani-main" />
                </div>
              ) : (
                <>
                  <span className="ProductDets_ntfy_btn_slect_size">
                    {!cartBtn ? "Select a Size" : "Add to Bag"}
                  </span>
                  <span className="ProductDets_ntfy_btn_AddtoBeg">
                    Add to Bag
                  </span>
                  <div className="ProductDets_ntfy_btn_price">
                    <span>{finalPrice} INR</span>
                  </div>
                </>
              )}
            </button>
          </div>

          <div className="ProductDets_bottom_links_wrap">
            <div className="ProductDets_info_links">
              {["Details", "Care", "Shipping", "Help"].map((label) => (
                <button className="ProductDets_info-btn" key={label}>
                  {label}
                </button>
              ))}
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
