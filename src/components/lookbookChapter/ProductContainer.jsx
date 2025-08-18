import React from "react";
import { formatePrice } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";

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
          <ProductCard
            key={`product-${index}`}
            href={"/product/" + item?._id || ""}
            src={path || ""}
            alt={altText}
            name={item?.name || ""}
            price={`Starts from ${formatePrice(
              minVariant?.variantPrice || item?.discountedPrice || ""
            )}`}
          />
        );
      })}
    </div>
  );
};

export default ProductContainer;
