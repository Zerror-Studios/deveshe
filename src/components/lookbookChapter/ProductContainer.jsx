import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductContainer = ({ data }) => {
  if (!data || data.length === 0) return;
  return (
    <div id="prodcut-container">
      {data?.map((item, index) => {
        const { path = "", altText = "" } = item?.assets?.[0] || {};
        return (
          <Link
            href={"/product/" + item?._id || ""}
            className="product-lb"
            key={`product-${index}`}
          >
            <div className="product_img_wrap">
            <Image width={1000} height={1000} src={path} alt={altText} />
            </div>
            <div className="product-info">
              <p>{item?.name || ""}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductContainer;
