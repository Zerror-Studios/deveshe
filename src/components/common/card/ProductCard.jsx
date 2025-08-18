import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductCard = ({ href, src, name, price, alt }) => {
  return (
    <Link href={href} className="common_product_card">
      <Image width={1000} height={1000} src={src} alt={alt} />
      <div className="product_card_details">
        <h4>{name}</h4>
        <h4>{price}</h4>
      </div>
    </Link>
  );
};

export default ProductCard;
