import React from "react";
import ProductCard from "../common/card/ProductCard";
import { formatePrice } from "@/utils/Util";

const ProductSection = ({ data }) => {
  if (!data && data.length === 0) return;
  const leftSideMinVariant = data[0]?.variants.reduce((min, item) =>
    item.variantPrice < min.variantPrice ? item : min
  );
  return (
    <>
      <div id="product_section">
        <div className="product_left_section">
          <ProductCard
            href={"/product/" + data[0]?._id || ""}
            src={data[0]?.assets[0]?.path || ""}
            name={data[0]?.name || ""}
            price={`Starts from ${formatePrice(
              leftSideMinVariant?.variantPrice || data[0]?.discountedPrice || ""
            )}`}
          />
        </div>
        <div className="product_right_section">
          {data?.slice(1, 11)?.map((item, index) => {
            const minVariant = item?.variants.reduce((min, item) =>
              item.variantPrice < min.variantPrice ? item : min
            );
            return (
              <ProductCard
              key={index}
                href={"/product/" + item?._id || ""}
                src={item?.assets[0]?.path || ""}
                name={item?.name || ""}
                price={`Starts from ${formatePrice(
                  minVariant?.variantPrice || item?.discountedPrice || ""
                )}`}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductSection;
