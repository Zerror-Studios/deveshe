import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { trackSelectItem } from "@/utils/analytics-events.util";

// Square product shots; the card is a quarter of the viewport on desktop
// (half of the 50% product section) and half on phones (RPERF-12).
const CARD_IMAGE_SIZE_PX = 600;
const DEFAULT_CARD_SIZES = "(max-width: 768px) 50vw, 25vw";

const ProductCard = ({
  href,
  src,
  name,
  price,
  alt,
  sizes = DEFAULT_CARD_SIZES,
  // PRD-013 select_item: optional, the card works without them.
  product,
  listName,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleSelect = () => {
    if (product) trackSelectItem(product, listName);
  };

  return (
    <Link
      href={href}
      onClick={handleSelect}
      className={`common_product_card ${
        !isMobile ? "skeleton-loading" : ""
      }`}
    >
      <Image
        className={isMobile ? "skeleton-loading" : ""}
        width={CARD_IMAGE_SIZE_PX}
        height={CARD_IMAGE_SIZE_PX}
        sizes={sizes}
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
