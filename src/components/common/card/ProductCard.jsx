import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProductCard = ({ href, src, name, price, alt }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 576);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <Link
      href={href}
      className={`common_product_card ${
        !isMobile && loading ? "skeleton-loading" : ""
      }`}
    >
      <Image
        className={isMobile && loading ? "skeleton-loading" : ""}
        width={1000}
        height={1000}
        src={src}
        alt={alt}
        onLoadingComplete={() => setLoading(false)}
      />

      <div className="product_card_details">
        <h4>{name}</h4>
        <h4>{price}</h4>
      </div>
    </Link>
  );
};

export default ProductCard;
