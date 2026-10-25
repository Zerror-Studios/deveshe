import React from "react";
import { getProductPriceLabel } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";

const ProductContainer = ({ data }) => {
  if (!data || data.length === 0) return;
  return (
    <div id="prodcut-container">
      {data?.map((item, index) => {
        const { path = "", altText = "" } = item?.assets?.[0] || {};
        return (
          <ProductCard
            key={`product-${index}`}
            href={"/product/" + item?.slug || item?._id}
            src={path || ""}
            alt={altText}
            name={item?.name || ""}
            price={getProductPriceLabel(item?.variants)}
            product={item}
            listName="Lookbook"
          />
        );
      })}
    </div>
  );
};

export default ProductContainer;
