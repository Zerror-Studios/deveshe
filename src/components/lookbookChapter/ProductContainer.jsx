import React from "react";
import { getProductPriceLabel } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";

// `listName` / `listId`: GA4 select_item from a lookbook (PRD-027 F10).
const ProductContainer = ({ data, listName = "Lookbook", listId }) => {
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
            listName={listName}
            listId={listId}
          />
        );
      })}
    </div>
  );
};

export default ProductContainer;
