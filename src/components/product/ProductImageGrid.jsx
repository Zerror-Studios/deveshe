import React from "react";
import Image from "next/image";

const ProductImageGrid = ({ assets = [], setSelectedAsset }) => {
  if (!assets && assets.length === 0) return;
  return (
    <div className="ProductDets_img_wrapper">
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
    </div>
  );
};

export default ProductImageGrid;
