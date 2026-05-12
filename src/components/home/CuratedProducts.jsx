import React from "react";

import CuratedProductCard from "@/components/common/card/CuratedProductCard";
import { getProductPriceLabel } from "@/utils/Util";
import ProductLoader from "@/components/loaders/ProductLoader";

function getFirstAsset(product) {
  return product?.assets?.length ? product.assets[0].path : "";
}

export default function CuratedProducts({ products = [] }) {
  return (
    <section className="curated-container">
      <h2 className="curated-heading">Latest / Curated</h2>
      {!products || products.length === 0 ? (
        <ProductLoader />
      ) : (
        <div className="curated-grid">
          {products.map((product) => (
            <CuratedProductCard
              key={product?._id || product?.slug}
              href={"/product/" + (product?.slug || "")}
              src={getFirstAsset(product)}
              alt={product?.name || ""}
              name={product?.name || ""}
              price={getProductPriceLabel(
                product?.variants,
                product?.discountedPrice
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}