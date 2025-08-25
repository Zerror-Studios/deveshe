import React, { useEffect, useState } from "react";
import ProductCard from "../common/card/ProductCard";
import { getProductPriceLabel } from "@/utils/Util";

const ProductSection = ({ data, sectionRef }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 576);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!data || data.length === 0) return null;

  const leftCard = (
    <ProductCard
      href={"/product/" + data[0]?._id || ""}
      src={data[0]?.assets[0]?.path || ""}
      alt={data[0]?.name || ""}
      name={data[0]?.name || ""}
      price={getProductPriceLabel(
        data?.[0]?.variants,
        data?.[0]?.discountedPrice
      )}
    />
  );

  return (
    <div ref={sectionRef} id="product_section">
      {/* Desktop → left and right separate */}
      {!isMobile && <div className="product_left_section">{leftCard}</div>}

      <div className="product_right_section">
        {/* Mobile → put left card here */}
        {isMobile && leftCard}

        {data?.slice(1, 11)?.map((item, index) => {
          return (
            <ProductCard
              key={index}
              href={"/product/" + item?._id || ""}
              src={item?.assets[0]?.path || ""}
              alt={item?.name || ""}
              name={item?.name || ""}
              price={getProductPriceLabel(
                item?.variants,
                item?.discountedPrice
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductSection;
