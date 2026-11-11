import React from "react";
import ProductGridCard from "@/components/common/card/ProductGridCard";

// `listName` / `listId`: GA4 select_item from a lookbook (PRD-027 F10).
const ProductContainer = ({ data, listName = "Lookbook", listId }) => {
  if (!data || data.length === 0) return null;

  return (
    <div id="prodcut-container" className="curated-grid lookbook-product-grid">
      {data.map((item, index) => (
        <ProductGridCard
          key={item?._id || item?.slug || `lookbook-product-${index}`}
          product={item}
          listName={listName}
          listId={listId}
        />
      ))}
    </div>
  );
};

export default ProductContainer;
