import React, { useEffect, useState } from "react";
import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// import required modules
import { Pagination } from "swiper/modules";

const ProductImageGrid = ({ assets = [], setSelectedAsset }) => {
  if (!assets && assets.length === 0) return;
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 576);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return (
    <div className="ProductDets_img_wrapper">
      {!isMobile ? (
        <>
          <div className="ProductDets_img_slider_wrap">
            <div className="ProductDets_img_slider_cntr">
              <div className="ProductDets_img_slider_cntr_sticky">
                {assets &&
                  assets?.map((item, index) => {
                    return (
                      <button
                        key={`product-image-slider-${index}`}
                        className="ProductDets_img_btn ProductDets_img_align"
                      >
                        <div className="ProductDets_imgs_grid_cntr">
                          <div className="ProductDets_img_single_cntr">
                            <Image
                              width={1000}
                              height={1000}
                              src={item?.path || ""}
                              alt={item?.altText || ""}
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
            {assets &&
              assets?.map((item, index) => {
                return (
                  <button
                    key={`product-image-${index}`}
                    className="ProductDets_Big_img_cntr"
                    onClick={() => setSelectedAsset(item)}
                  >
                    <div className="shop_card_img_bgcover">
                      <div className="ProductDets_Big_card_img-main_cntr">
                        <Image
                          width={1000}
                          height={1000}
                          src={item?.path || ""}
                          alt={item?.altText || ""}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </>
      ) : (
        <Swiper
          pagination={true}
          modules={[Pagination]}
          className="mySwiper"
        >
          {assets &&
            assets?.map((item, index) => {
              return (
                <SwiperSlide key={index} className="skeleton-loading">
                  <Image
                    onClick={() => setSelectedAsset(item)}
                    width={1000}
                    height={1000}
                    src={item?.path || ""}
                    alt={item?.altText || ""}
                  />
                </SwiperSlide>
              );
            })}
        </Swiper>
      )}
    </div>
  );
};

export default ProductImageGrid;
