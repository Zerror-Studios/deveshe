import React, { useEffect, useState } from "react";
import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// import required modules
import { Pagination } from "swiper/modules";
import {
  GalleryActionEnum,
  trackGalleryInteraction,
} from "@/utils/analytics-events.util";

// Desktop shows the gallery beside the details; phones get the swiper
// (RPERF-12).
const DESKTOP_GRID_SIZES = "(max-width: 1000px) 100vw, 33vw";

const ProductImageGrid = ({ assets = [], setSelectedAsset, setIsPreviewOpen, itemId }) => {
  if (!assets && assets.length === 0) return;
  // PRD-013 gallery_interaction: opening the preview is a zoom.
  const openPreview = (item) => {
    trackGalleryInteraction(itemId, GalleryActionEnum.ZOOM);
    setSelectedAsset(item);
    setIsPreviewOpen && setIsPreviewOpen(true);
  };
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1000);
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
                            {item?.type === "VIDEO" ? (
                              <video
                                src={item?.path || ""}
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Image
                                width={1000}
                                height={1000}
                                sizes={DESKTOP_GRID_SIZES}
                                preload={index === 0}
                                fetchPriority={index === 0 ? "high" : undefined}
                                src={item?.path || ""}
                                alt={item?.altText || ""}
                              />
                            )}
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
                      onClick={() => openPreview(item)}
                    >
                      <div className="shop_card_img_bgcover">
                        <div className="ProductDets_Big_card_img-main_cntr">
                          {item?.type === "VIDEO" ? (
                            <video
                              src={item?.path || ""}
                              autoPlay
                              muted
                              loop
                              playsInline
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Image
                              width={1000}
                              height={1000}
                              sizes={DESKTOP_GRID_SIZES}
                              preload={index === 0}
                              fetchPriority={index === 0 ? "high" : undefined}
                              src={item?.path || ""}
                              alt={item?.altText || ""}
                            />
                          )}
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
          onSlideChange={() =>
            trackGalleryInteraction(itemId, GalleryActionEnum.SWIPE)
          }
        >
          {assets &&
            assets?.map((item, index) => {
              return (
                <SwiperSlide key={index} className="skeleton-loading">
                  {item?.type === "VIDEO" ? (
                    <video
                      onClick={() => openPreview(item)}
                      src={item?.path || ""}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Image
                      onClick={() => openPreview(item)}
                      width={1000}
                      height={1000}
                      sizes="100vw"
                      // The first photo is the page's LCP on a phone
                      preload={index === 0}
                      fetchPriority={index === 0 ? "high" : undefined}
                      src={item?.path || ""}
                      alt={item?.altText || ""}
                    />
                  )}
                </SwiperSlide>
              );
            })}
        </Swiper>
      )}
    </div>
  );
};

export default ProductImageGrid;
