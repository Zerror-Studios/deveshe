import React, { useEffect, useState } from "react";
import ProductCard from "../common/card/ProductCard";
import { formatePrice } from "@/utils/Util";

const ProductSection = ({ data }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 576);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!data || data.length === 0) return null;

  const leftSideMinVariant = data[0]?.variants.reduce((min, item) =>
    item.variantPrice < min.variantPrice ? item : min
  );

  const leftCard = (
    <ProductCard
      href={"/product/" + data[0]?._id || ""}
      src={data[0]?.assets[0]?.path || ""}
      alt={data[0]?.name || ""}
      name={data[0]?.name || ""}
      price={`Starts from ${formatePrice(
        leftSideMinVariant?.variantPrice || data[0]?.discountedPrice || ""
      )}`}
    />
  );

  return (
    <div id="product_section">
      {/* Desktop → left and right separate */}
      {!isMobile && <div className="product_left_section">{leftCard}</div>}

      <div className="product_right_section">
        {/* Mobile → put left card here */}
        {isMobile && leftCard}

        {data?.slice(1, 11)?.map((item, index) => {
          const minVariant = item?.variants.reduce((min, item) =>
            item.variantPrice < min.variantPrice ? item : min
          );
          return (
            <ProductCard
              key={index}
              href={"/product/" + item?._id || ""}
              src={item?.assets[0]?.path || ""}
              alt={item?.name || ""}
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

export default ProductSection;
