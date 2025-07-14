import Button from "@/components/common/Button";
import Footer from "@/components/common/Footer";
import gsap from "gsap";
import { useDispatch } from "react-redux";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import { useRouter } from "next/router";
import ProductLoader from "@/components/loaders/ProductLoader";
import { addtocart } from "@/features/cart/CartSlice";
import { useContext, useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import AnimBtn from "@/components/common/AnimBtn";
import { ModalContext } from "@/components/context/ModalProvider";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_CLIENT_SIDE_PRODUCT_BY_ID, GET_PRODUCTS } from "@/graphql/products.gql";
gsap.registerPlugin(ScrollTrigger);
const ProductPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const [colorSelect, setColorSelect] = useState(null);
  const [variantSelect, setVariantSelect] = useState({});
  const [enableAddToCart, setEnableAddToCart] = useState(false);
  const [selectedVarients, setSelectedVariants] = useState({});
  const [finalPrice, setFinalPrice] = useState(0);
  const [openBag, setOpenBag] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useContext(ModalContext);

  const { data: productData, loading: productLoading, error: productError } = useQuery(GET_CLIENT_SIDE_PRODUCT_BY_ID, {
    variables: {
      getClientSideProductByIdId: id,
    },
    skip: !id,
  });

  const { data: productsData, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      offset: 0,
      limit: 5,
      filter: {
        search: null,
      },
    },
  });

  const product = productData?.getClientSideProductById;
  const images = product?.assets?.map(asset => asset.path) || [];
  const desc = product?.description || "";


  const handleEnablebtn = () => {
    if (product && product.productOptions) {
      const requiredOptions = product.productOptions.length;
      const selectedOptions = Object.keys(selectedVarients).length;
      setEnableAddToCart(selectedOptions >= requiredOptions);
    }
  };

  useEffect(() => {
    if (product) {
      // Set price - handle both discountedPrice and price
      if (product.discountedPrice && product.discountedPrice > 0) {
        setFinalPrice(product.discountedPrice);
      } else {
        setFinalPrice(product.price);
      }

      // Set default selections for all product options
      if (product.productOptions && product.productOptions.length > 0) {
        const defaultSelections = {};
        product.productOptions.forEach((option) => {
          if (option.choices && option.choices.length > 0) {
            defaultSelections[option.optionName] = option.choices[0].name;
          }
        });
        setSelectedVariants(defaultSelections);

        // Set default color selection index
        const colorOption = product.productOptions.find(
          (option) => option.showInProductPageAs === "Color"
        );
        if (colorOption && colorOption.choices.length > 0) {
          setColorSelect(0);
        }
      }
    }
  }, [product]);

  const handleVariants = (name, value) => {
    const newVar = { ...selectedVarients, [name]: value };
    setSelectedVariants((prev) => ({ ...prev, [name]: value }));
    handleEnablebtn();
    
    // Find matching variant and update price
    const matchingVariant = product?.variants?.find(variant => {
      return variant.selectedOptions?.some(option => 
        option[name] === value
      );
    });
    
    if (matchingVariant) {
      const diffPrice = matchingVariant.priceDifference || 0;
      let finalPriceNew = 0;
      if (product.discountedPrice && product.discountedPrice > 0) {
        finalPriceNew = product.discountedPrice + diffPrice;
      } else {
        finalPriceNew = product.price + diffPrice;
      }
      setFinalPrice(finalPriceNew);
    }
  };



  const handleVariantSelection = (variantTitle, option, index) => {
    setVariantSelect((prev) => {
      // Create a new object to avoid mutating the previous state
      const updatedVariants = { ...prev };
      // Update or add the new variant selection
      updatedVariants[variantTitle] = `${variantTitle}-${index}`;
      return updatedVariants;
    });
  };

  const handleAddToCart = () => {
    if (enableAddToCart) {
      setTimeout(() => {
        setModalIsOpen(true);
        setOpenBag(true);
      }, 500);
      setBtnLoading(true);
      const vararray = [];
      vararray.push(selectedVarients);
      dispatch(
        addtocart({
          name: product.name,
          img: images[0],
          productid: product._id,
          qty: 1,
          variants: vararray,
        })
      );
      // setSelectedVariants({});
      // setColorSelect(null);
      // setVariantSelect({});
    }
  };

  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    if (window.innerWidth >= 1000) {
      const container = document.querySelector(".ProductDets_Big_img_wrap");
      const BlurContainer = document.querySelector(".ProductDets_grid");
      if (container) {
        const innerHeight = container.clientHeight;
        let sidebarHeight = "12.6117%";
        if (window.innerWidth >= 1300) {
          sidebarHeight = "12.6117%";
        } else if (window.innerWidth >= 1000) {
          sidebarHeight = "24.2424%";
        }

        gsap.fromTo(
          ".ProductDets_img_slider_bar",
          { height: sidebarHeight },
          {
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: `+=${innerHeight}`,
              scrub: true,
              markers: false,
            },
            top: "100%",
            transform: `translateY(-100%)`,
          }
        );
      } else {
        console.error(
          'Element with className "ProductDets_Big_img_wrap" not found.'
        );
      }
      // gsap.to(document.querySelector(".ProductDets_grid"), {
      //   // onComplete:()=>{
      //   //   gsap.to(document.querySelector(".ProductDets_grid"), {filter: "blur(10px)",duration:.5})
      //   // },
      //   onUpdate: function(self) {
      //     if (self.progress === 1) {
      //       gsap.to(".ProductDets_grid", { filter: "blur(10px)", duration: 0.5 });
      //     } else if (self.progress < 1) {
      //       gsap.to(".ProductDets_grid", { filter: "blur(0px)", duration: 0.5 });
      //     }
      //   },
      //   scrollTrigger: {
      //     trigger: ".Similar_prd_wrap",
      //     scroller:"body",
      //     start: "top 0%",
      //     end: "top -350%",
      //     scrub: true,
      //     markers: true,
      //   },
      //   filter: "blur(10px)",
      //   transform: "translateZ(0)",
      // });
    }
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: ".Similar_prd_wrap",
      scroller: "body",
      start: "top 0%",
      end: "top -350%",
      scrub: true,
      markers: false,
      onUpdate: (self) => {
        if (self.progress === 1) {
          gsap.to(".ProductDets_grid", { filter: "blur(10px)", duration: 0.5 });
        } else {
          gsap.to(".ProductDets_grid", { filter: "blur(0px)", duration: 0.5 });
        }
      },
    });
  }, []);

  // State to manage modal visibility and the selected image
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 0) {
        const ReactModalPortalImageCntr = document.querySelector(
          ".ReactModalPortal_img_cntr"
        );
        const cursor = document.querySelector(
          ".ReactModalPortal_img_cntr_cursor"
        );
        const allBigImgCntr = document.querySelectorAll(
          ".ProductDets_Big_card_img-main_cntr img"
        );

        allBigImgCntr.forEach((img) => {
          img.addEventListener("click", () => {
            setSelectedImage(img.src); // Set the selected image URL
            setModalVisible(true); // Show the modal
            console.log("clicked img");
          });
        });

        if (cursor) {
          cursor.addEventListener("click", () => {
            setModalVisible(false); // Hide the modal
          });
        }

        // Cleanup event listeners on component unmount
        return () => {
          allBigImgCntr.forEach((img) => {
            img.removeEventListener("click", () => {
              setSelectedImage(img.src);
              setModalVisible(true);
            });
          });

          if (cursor) {
            cursor.removeEventListener("click", () => {
              setModalVisible(false);
            });
          }
        };
      }
    };

    handleResize(); // Initial call to handle any pre-existing elements
    window.addEventListener("resize", handleResize); // Add resize event listener

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  const [btnLoading, setBtnLoading] = useState(false);
  const handleBtnLoading = () => {
    if (btnLoading) {
      setTimeout(() => {
        setBtnLoading(false);
      }, 3000);
    }
  };
  useEffect(() => {
    handleBtnLoading();
  }, [btnLoading]);



  return (
    <>
      {isModalVisible && (
        <div className="ReactModalPortal_img_cntr" data-lenis-prevent>
          <div className="ReactModalPortal_img_cntr_overlay">
            <div className="ReactModalPortal_img_cntr_cursor">
              <div className="ReactModalPortal_img_cross">
                <RxCross2 />
              </div>
              <div className="ReactModalPortal_img_cntr_grid">
                <div className="ReactModalPortal_img_cntr_grid_cover">
                  <Image
                    width={1000}
                    height={1000}
                    src={selectedImage}
                    alt="Model is wearing Nour Hammour's Henri Double Breasted Leather Trench Coat in beige - Front  "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {product && !productLoading ? (
        <>
          <div className="ProductDetails_wrapper">
            <div className="ProductDetails_cntr">
              <div className="ProductDets_main"></div>
              <div className="ProductDets_grid">
                <div className="ProductDets_img_wrapper">
                  <div className="ProductDets_img_slider_wrap">
                    <div className="ProductDets_img_slider_cntr">
                      <div className="ProductDets_img_slider_cntr_sticky">
                        {images &&
                          images.map((items, i) => {
                            return (
                              <button
                                key={i}
                                className="ProductDets_img_btn ProductDets_img_align"
                              >
                                <div className="ProductDets_imgs_grid_cntr">
                                  <div className="ProductDets_img_single_cntr">
                                    <Image
                                      width={1000}
                                      height={1000}
                                      src={`${items}`}
                                      alt={`images`}
                                    />
                                  </div>
                                </div>
                              </button>
                            );
                          })}

                        <div className="ProductDets_img_slider_bar_cntr">
                          <div className="ProductDets_img_slider_bar"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ProductDets_Big_img_wrap">
                    {images &&
                      images.map((items) => {
                        return (
                          <button
                            key={items.id}
                            className="ProductDets_Big_img_cntr"
                          >
                            <div className="shop_card_img_bgcover">
                              <div className="ProductDets_Big_card_img-main_cntr">
                                <Image
                                  width={1000}
                                  height={1000}
                                  src={`${items}`}
                                  alt={`images`}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
                <div className="ProductDets_text_wrapper">
                  <div className="ProductDets_blank-div">
                    <div className="ProductDets_text-container">
                      <div className="ProductDets_text_container_resp">
                        <div>
                          {/* <span className="ProductDets_text_container_resp_brandName ProductDets_common_style">
                        zakary
                      </span> */}
                          <span className="ProductDets_text_container_resp_productName ProductDets_common_style">
                            {product?.name ?? ""}
                          </span>
                        </div>
                        <div className="ProductDets_text_container_price_resp ProductDets_common_style">
                          <div className="ProductDets_text_container_price_resp_flex">
                            <span>{finalPrice}</span>
                            <span>&nbsp;INR</span>
                          </div>
                        </div>
                      </div>
                      <div className="ProductDets_title_wrap">
                        {/* <h1 className="ProductDets_text_container_brandName ProductDets_common_style">
                      zakary
                    </h1> */}
                        <h2 className="ProductDets_text_container_productName ProductDets_common_style">
                          {product?.name ?? ""}
                        </h2>
                      </div>
                      <div className="ProductDets_reverse_content_wrapper">
                        <div className="ProductDets_description_wrap">
                          {/* <div className="ProductDets_text_container_prdt_Desc-title">
                        Description
                      </div> */}
                          <div className="ProductDets_text-container_prdt_Desc">
                            <div>
                              {desc && (
                                <div
                                  dangerouslySetInnerHTML={{ __html: desc }}
                                />
                              )}
                            </div>
                            <div>
                              Fits large to size, we suggest taking one size
                              smaller than usual.
                            </div>
                          </div>
                        </div>
                        <div className="ProductDets_Variants">
                          <div className="ProductDets_collection-wrap">
                            <fieldset className="ProfuctDets_fieldset">
                              {product &&
                                product.productOptions &&
                                product.productOptions.length > 0 &&
                                product.productOptions
                                  .filter(
                                    (option) =>
                                      option.showInProductPageAs === "Color"
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
                            <div
                              id="easysize_button"
                              className="easysize_button"
                            >
                              {product &&
                                product.productOptions &&
                                product.productOptions.length > 0 &&
                                product.productOptions
                                  .filter(
                                    (option) =>
                                      option.showInProductPageAs === "Color"
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
                          {product &&
                            product.productOptions &&
                            product.productOptions.length > 0 &&
                            product.productOptions
                              .filter(
                                (option) =>
                                  option.showInProductPageAs === "List"
                              )
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
                                        productOption.choices.map(
                                          (choice, j) => (
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
                                                variantSelect[
                                                  productOption.optionName
                                                ] ==
                                                `${productOption.optionName}-${j}`
                                                  ? "ProductDets-size_numbers acitve"
                                                  : "ProductDets-size_numbers"
                                              }
                                            >
                                              {choice.name}
                                            </div>
                                          )
                                        )}
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
                                    {/* <div id="easysize-recommendation"></div> */}
                                  </div>
                                </div>
                              ))}
                        </div>
                      </div>

                      <div className="ProductDets_Notify_wrap">
                        <button
                          className="ProductDets_ntfy_btn ProductDets_ntfy_btn_grid"
                          id="easysize-cart-button"
                          style={btnLoading ? { backgroundColor: "black" } : {}}
                          onClick={handleAddToCart}
                        >
                          {btnLoading ? (
                            <>
                              <div className="ani-wrap">
                                <div className="ani-main"></div>
                              </div>
                            </>
                          ) : (
                            <>
                              {!enableAddToCart ? (
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
                          <button className="ProductDets_info-btn">
                            Details
                          </button>
                          <button className="ProductDets_info-btn">Care</button>
                          <button className="ProductDets_info-btn">
                            Shipping
                          </button>
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
                <div className="ProductDets_text_btn_resp_cntr ProductDets_common_style">
                  <div className="ProductDets_text_btn_resp_wrap">
                    <button
                      style={btnLoading ? { backgroundColor: "black" } : {}}
                      onClick={handleAddToCart}
                      className="ProductDets_text_btn_resp_w-full ProductDets_add_btn_mobile"
                    >
                      <div className="_btn_wrapper _btn_height _w-full">
                        <div className="ProductDets_text_btn_resp_flex">
                          {btnLoading ? (
                            <>
                              <div className="ani-wrap">
                                <div className="ani-main"></div>
                              </div>
                            </>
                          ) : (
                            <>
                              {!enableAddToCart ? (
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
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="Similar_prd_wrap">
                <h2 className="Similar_prd_head">
                  <span className="Similar_prd_pieces">Pieces</span>
                  <span className="Similar_prd_like-this">
                    You may also like
                  </span>
                </h2>
                <div className="Similar_prd_cntr">
                  {productsData?.getClientSideProducts?.products.map((items, idx) => {
                    return (
                      <div key={idx} className="Similar_prd_card_cntr">
                        <Link
                          href={{
                            pathname: "/product",
                            query: { id: items._id },
                          }}
                          className="shop-card_grid shop-card-w-full"
                        >
                          <div className="similar-prd shop_card_img_bgcover">
                            <div className="shop_card_img-main_cntr">
                              <Image
                                width={1000}
                                height={1000}
                                src={items.assets[0]?.path}
                                alt={`${items.name}`}
                              />
                            </div>
                          </div>
                          <div
                            className="similar-prd-text"
                            style={{
                              padding: "15px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              flexGrow: 1,
                            }}
                          >
                            <h4
                              className="similar-prd-dets _ProductName"
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                margin: "0",
                                lineHeight: "1.4",
                                color: "#333",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {" "}
                              {`${items.name}`}
                            </h4>
                            <div className="shop_card_price_wrap">
                              <div
                                className="shop_card_price_cntr"
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#000",
                                }}
                              >
                                <span>{`${items.price}`}</span>
                                <span>&nbsp;INR</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                {/* <Footer /> */}
              </div>
            </div>
          </div>
        </>
      ) : (
        <ProductLoader />
      )}
    </>
  );
};

export default ProductPage;
