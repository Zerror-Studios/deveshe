import React from "react";
import { formatePrice } from "@/utils/Util";
import ProductCard from "../common/card/ProductCard";

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
          const minVariant = item?.variants.reduce((min, item) =>
            item.variantPrice < min.variantPrice ? item : min
          );
          return (
            <ProductCard
              key={idx}
              href={`/product/${item?._id || ""}`}
              src={item?.assets?.[0]?.path || ""}
              alt={item?.assets?.[0]?.altText || ""}
              name={item?.name || ""}
              price={`Starts from ${formatePrice(
                minVariant?.variantPrice || item?.discountedPrice || ""
              )}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductListGrid;
