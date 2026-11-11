"use client";

/**
 * Product card of the curated grids (home, shop, lookbook products): the
 * live site's design, with the listing card's behaviour (PRD-013
 * select_item, PRD-020 FR-13 stock badge, LCP preload for the first row).
 */

import Image from "next/image";
import Link from "next/link";
import { getProductPriceLabel } from "@/utils/Util";
import { trackSelectItem } from "@/utils/analytics-events.util";
import { getListingBadge } from "@/utils/stock-signal.util";

const DEFAULT_GRID_SIZES = "(max-width: 768px) 50vw, 25vw";

export function getProductGridCardProps(product) {
  const asset = product?.assets?.[0];
  return {
    href: `/product/${product?.slug || product?._id || ""}`,
    src: asset?.path || "",
    alt: asset?.altText || product?.name || "",
    name: product?.name || "",
    // Prices come from the variants (there is no product-level price)
    price: getProductPriceLabel(product?.variants),
  };
}

export default function ProductGridCard({
  product,
  href,
  src,
  alt,
  name,
  price,
  // PRD-013 select_item: optional, the card works without them
  listName,
  // PRD-027 F10: the lookbook's GA4 item_list_id
  listId,
  sizes = DEFAULT_GRID_SIZES,
  // The first row of a grid: loaded at once, it is the page's LCP
  preload = false,
}) {
  const card = product
    ? getProductGridCardProps(product)
    : { href, src, alt, name, price };

  if (!card?.href || card.href === "/product/") return null;

  // PRD-020 FR-13: "Sold out" / "Low stock" (null = no badge)
  const badge = getListingBadge(product?.availability);

  const handleSelect = () => {
    if (product) trackSelectItem(product, listName, listId);
  };

  return (
    <Link
      href={card.href}
      onClick={handleSelect}
      data-testid="product-card-link"
      className="curated-card"
    >
      <div className="curated-imageWrapper">
        {card.src ? (
          <Image
            src={card.src}
            alt={card.alt}
            fill
            className="curated-image"
            sizes={sizes}
            preload={preload}
            fetchPriority={preload ? "high" : undefined}
          />
        ) : (
          <div className="curated-imagePlaceholder" aria-hidden />
        )}
        {badge && <span className="product_card_badge">{badge}</span>}
      </div>
      <div className="curated-meta">
        {/* Text, not headings: a card title would break the heading order */}
        <p className="curated-name">{card.name}</p>
        <p className="curated-price">{card.price}</p>
      </div>
    </Link>
  );
}
