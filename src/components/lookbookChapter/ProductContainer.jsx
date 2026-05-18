import React from "react";
import ProductGridCard from "@/components/common/card/ProductGridCard";

const ProductContainer = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div id="prodcut-container" className="curated-grid lookbook-product-grid">
      {data.map((item, index) => (
        <ProductGridCard
          key={item?._id || item?.slug || `lookbook-product-${index}`}
          product={item}
        />
      ))}
    </div>
  );
};

export default ProductContainer;
