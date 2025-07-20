import React from "react";
import Link from "next/link";
import Image from "next/image";

const ProductListGrid = ({ title = "You may also like", data }) => {
  if (!data && data.length === 0) return;
  return (
    <div className="Similar_prd_wrap">
      <h2 className="Similar_prd_head">
        <span className="Similar_prd_pieces">Pieces</span>
        <span className="Similar_prd_like-this">{title || ""}</span>
      </h2>
      <div className="Similar_prd_cntr">
        {data?.map((item, idx) => {
          return (
            <div key={`product-list-${idx}`} className="Similar_prd_card_cntr">
              <Link
                href={`/product/${item?._id || ""}`}
                className="shop-card_grid shop-card-w-full"
              >
                <div className="similar-prd shop_card_img_bgcover">
                  <div className="shop_card_img-main_cntr">
                    <Image
                      width={1000}
                      height={1000}
                      src={item?.assets?.[0]?.path || ""}
                      alt={item?.assets?.[0]?.altText || ""}
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
                    {item?.name || ""}
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
                      <span>{item?.price || ""}</span>
                      <span>&nbsp;INR</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductListGrid;
