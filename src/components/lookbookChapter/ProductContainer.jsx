import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatePrice } from "@/utils/Util";

const ProductContainer = ({ data }) => {
  if (!data || data.length === 0) return;
  return (
    <div id="prodcut-container">
      {data?.map((item, index) => {
        const { path = "", altText = "" } = item?.assets?.[0] || {};
        const minVariant = item?.variants.reduce((min, item) =>
          item.variantPrice < min.variantPrice ? item : min
        );
        return (
          <Link
            href={"/product/" + item?._id || ""}
            className="product-lb"
            key={`product-${index}`}
          >
            <div className="product_img_wrap">
              <Image width={1000} height={1000} src={path} alt={altText} />
            </div>
            <div className="product-info" style={{flexDirection: "row", justifyContent: "space-between"}}>
              <p>{item?.name || ""}</p>
              <p>
                {`Starts from ${formatePrice(
                  minVariant?.variantPrice || item?.discountedPrice || ""
                )}`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductContainer;
