import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { trackSelectItem } from "@/utils/analytics-events.util";
import { getListingBadge } from "@/utils/stock-signal.util";

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
  // PRD-027 F10: the lookbook's GA4 item_list_id
  listId,
  // The first row of a listing: loaded at once, it is the page's LCP
  preload = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // PRD-020 FR-13: "Sold out" / "Low stock" from `product.availability`
  // (null = no badge, as before).
  const badge = getListingBadge(product?.availability);

  const handleSelect = () => {
    if (product) trackSelectItem(product, listName, listId);
  };

  return (
    <Link
      href={href}
      onClick={handleSelect}
      data-testid="product-card-link"
      className={`common_product_card ${
        !isMobile ? "skeleton-loading" : ""
      }`}
    >
      <Image
        className={isMobile ? "skeleton-loading" : ""}
        width={CARD_IMAGE_SIZE_PX}
        height={CARD_IMAGE_SIZE_PX}
        sizes={sizes}
        preload={preload}
        fetchPriority={preload ? "high" : undefined}
        src={src}
        alt={alt}
      />

      {badge && <span className="product_card_badge">{badge}</span>}
      <div className="product_card_details">
        {/* Text, not headings: a card title would break the heading order */}
        <p>{name}</p>
        <p>{price}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
