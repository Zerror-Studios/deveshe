"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProductCard = ({ href, src, name, price, alt }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <Link
      href={href}
      className={`common_product_card ${
        !isMobile ? "skeleton-loading" : ""
      }`}
    >
      <Image
        className={isMobile ? "skeleton-loading" : ""}
        width={1000}
        height={1000}
        src={src}
        alt={alt}
      />

      <div className="product_card_details">
        <h4>{name}</h4>
        <h4>{price}</h4>
      </div>
    </Link>
  );
};

export default ProductCard;
