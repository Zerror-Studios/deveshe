import React, { useEffect, useState } from "react";
import ProductCard from "../common/card/ProductCard";
import { getProductPriceLabel } from "@/utils/Util";
import ProductLoader from "../loaders/ProductLoader";

const ProductSection = ({ data, sectionRef }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // fallback loader if data is null or empty
  if (!data || data.length === 0) {
    return <ProductLoader />;
  }

  const getFirstAsset = (product) =>
    product?.assets && product.assets.length > 0 ? product.assets[0].path : "";

  const leftCard = (
    <ProductCard
      href={"/product/" + (data[0]?._id || "")}
      src={getFirstAsset(data[0])}
      alt={data[0]?.name || ""}
      name={data[0]?.name || ""}
      price={getProductPriceLabel(data[0]?.variants, data[0]?.discountedPrice)}
    />
  );

  return (
    <div ref={sectionRef} id="shop">
      {/* Desktop → left and right separate */}
      {!isMobile && <div className="product_left_section skeleton-loading">{leftCard}</div>}

      <div className="product_right_section">
        {/* Mobile → put left card here */}
        {isMobile && leftCard}

        {data.slice(1, 11).map((item, index) => (
          <ProductCard
            key={index}
            href={"/product/" + (item?._id || "")}
            src={getFirstAsset(item)}
            alt={item?.name || ""}
            name={item?.name || ""}
            price={getProductPriceLabel(item?.variants, item?.discountedPrice)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
