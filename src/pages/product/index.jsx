import Button from "@/components/common/Button";
import Footer from "@/components/common/Footer";
import { dbProdData, ShopCardDetailsHome } from "@/helpers";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { editProduct } from "../../../api_fetch/admin/Product";
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
gsap.registerPlugin(ScrollTrigger);
const ProductPage = () => {
  const [product, setProduct] = useState({});
  const [images, setImages] = useState([
    "/newproduct/BI07.jpg",
    "/newproduct/BI072.jpg",
    "/newproduct/BI071.jpg",
  ]);
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const [colorSelect, setColorSelect] = useState(null);
  const [variantSelect, setVariantSelect] = useState({});
  const [enableAddToCart, setEnableAddToCart] = useState(false);
  const [selectedVarients, setSelectedVariants] = useState({});
  const [finalPrice, setFinalPrice] = useState(0);
  const [desc, setDesc] = useState("");
  const [openBag, setOpenBag] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useContext(ModalContext);

  const fetchData = async () => {
    try {
      if (id) {
        // const res = await editProduct(id);
        const res = dbProdData.find((p) => p._id === id);

        if (res) {
          setProduct(res);
          // setImages([...res.images]);
          if (res.discountperunit) {
            setFinalPrice(res.priceperunit - res.discountperunit);
          } else {
            setFinalPrice(res.priceperunit);
          }

          if (res.color) {
            setColorSelect(0);
            const c = res.colorVar.options[0];
            setSelectedVariants((prev) => ({ ...prev, Color: c }));
          }

          if (res.info) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(res.info, "text/html");
            const paragraph = doc.body.firstChild;
            setDesc(paragraph.textContent, "eedcde");
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleEnablebtn = () => {
    if (product) {
      if (product.colorVar) {
        if (
          Object.keys(selectedVarients).length + 1 ==
          product.variants.length + 1
        ) {
          setEnableAddToCart(true);
        }
      } else {
        if (
          Object.keys(selectedVarients).length + 1 ==
          product.variants.length
        ) {
          setEnableAddToCart(true);
        }
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 200);
  }, [id]);

  const handleVariants = (name, value) => {
    console.log("hey added");

    const newVar = { ...selectedVarients, [name]: value };
    setSelectedVariants((prev) => ({ ...prev, [name]: value }));
    handleEnablebtn();
    const resultIndex = linearSearch(product.variantsData, newVar);
    if (resultIndex != -1) {
      const diffPrice =
        product.variantsDetails[resultIndex].priceDifference || 0;
      let finalPriceNew = 0;
      if (product.discountperunit) {
        finalPriceNew =
          product.priceperunit - product.discountperunit + diffPrice;
      } else {
        finalPriceNew = product.priceperunit + diffPrice;
      }
      setFinalPrice(finalPriceNew);
    }
  };

  function linearSearch(arr, criteria) {
    for (let i = 0; i < arr.length; i++) {
      const variant = arr[i];
      if (isObjectMatch(variant, criteria)) {
        return i;
      }
    }

    return -1;
  }

  function isObjectMatch(obj, criteria) {
    return Object.keys(criteria).every((key) =>
      obj.some((prop) => prop[key] === criteria[key])
    );
  }

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

  const ShopCardDetails = [
    {
      id: 1,
      image1: "/newproduct/BI02.jpg",
      BrandName: "BrandName",
      ProductName: "ProductName",
      price: "1200",
    },
    {
      id: 2,
      image1: "/newproduct/BI03.jpg",
      BrandName: "BrandName",
      ProductName: "ProductName",
      price: "1200",
    },
    {
      id: 3,
      image1: "/newproduct/BI04.jpg",
      BrandName: "BrandName",
      ProductName: "ProductName",
      price: "1200",
    },
    {
      id: 4,
      image1: "/newproduct/BI05.jpg",
      BrandName: "BrandName",
      ProductName: "ProductName",
      price: "1200",
    },
    {
      id: 5,
      image1: "/newproduct/BI07.jpg",
      BrandName: "BrandName",
      ProductName: "ProductName",
      price: "1200",
    },
  ];

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
      {Object.keys(product) != 0 ? (
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
                              <p>
                                <meta charSet="utf-8" />
                                <span>{desc ?? ""}</span>
                              </p>
                            </div>
                            <div>
                              Fits large to size, we suggest taking one size
                              smaller than usual.
                            </div>
                          </div>
                        </div>
                        <div className="ProductDets_Variants">
                          {/* {(product?.color ?? false) && ( */}
                          {/* <div className="ProductDets_colorVariant_wrap">
                        <span className="ProductDets_colorVariant">Color</span>
                        <span className="ProductDets_colorVariant">Scotch</span>
                      </div> */}
                          {/* )} */}
                            <span className="title_size_color">Color</span>
                          <div className="ProductDets_collection-wrap">
                            <fieldset className="ProfuctDets_fieldset">
                              {product &&
                                product.colorVar &&
                                product.colorVar.options.map((el, i) => (
                                  <div
                                    aria-label="Beige"
                                    onClick={() => {
                                      setColorSelect(i);
                                      handleVariants(
                                        "Color",
                                        product.colorVar.options[i]
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
                                            style={{ backgroundColor: el }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </fieldset>
                          </div>
                          <div className="ProductDets-size_assist_cntr">
                            <div
                              id="easysize_button"
                              className="easysize_button"
                            >
                              {product.colorVar.options[colorSelect]}
                            </div>
                          </div>
                        </div>
                        <div className="ProductDets_size_Mainwrap">
                          <span className="title_size_color">Size</span>
                          {product &&
                            product.variants &&
                            product.variants.map((variant, i) => (
                              <div
                                className="ProductDets_size_wrap"
                                key={`varient-${i}`}
                              >
                                <div className="ProductDets-size_numbers_cntr">
                                  <div
                                    className="ProductDets-size_numbers_inner"
                                    id="easysize-size-selector"
                                  >
                                    {variant.options &&
                                      variant.options.map((option, j) => (
                                        <div
                                          key={`varientOptions-${j}`}
                                          onClick={() => {
                                            handleVariants(
                                              variant.title,
                                              option
                                            );
                                            handleVariantSelection(
                                              variant.title,
                                              option,
                                              j
                                            );
                                          }}
                                          aria-current="page"
                                          className={
                                            variantSelect[variant.title] ==
                                            `${variant.title}-${j}`
                                              ? "ProductDets-size_numbers acitve"
                                              : "ProductDets-size_numbers"
                                          }
                                        >
                                          {option}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                <div className="ProductDets-size_assist_cntr">
                                  {/* {variant?.title ?? ""} */}
                                  {/* <div id="easysize-placeholder"></div> */}
                                  <div
                                    id="easysize_button"
                                    className="easysize_button"
                                  >
                                    {variant?.title ?? ""} Assistance
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
                  {ShopCardDetailsHome.map((items, idx) => {
                    return (
                      <div key={idx} className="Similar_prd_card_cntr">
                        <Link
                          href={{
                            pathname: "/product",
                            query: { id: items.id },
                          }}
                          className="shop-card_grid shop-card-w-full"
                        >
                          <div className="similar-prd shop_card_img_bgcover">
                            <div className="shop_card_img-main_cntr">
                              <Image
                                width={1000}
                                height={1000}
                                src={`${ShopCardDetails[idx].image1}`}
                                alt={`${items.BrandName}`}
                              />
                            </div>
                          </div>
                          <div className="similar-prd-text">
                            {/* <h3 className="similar-prd-dets _brandName">{`${items.BrandName}`}</h3> */}
                            <h4 className="similar-prd-dets _ProductName">
                              {" "}
                              {`${items.ProductName}`}
                            </h4>
                            <div className="shop_card_price_wrap">
                              <div className="shop_card_price_cntr">
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
        <>
          <ProductLoader />
        </>
      )}
    </>
  );
};

export default ProductPage;
