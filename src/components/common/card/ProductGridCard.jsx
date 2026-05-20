import Image from "next/image";
import Link from "next/link";
import { getProductPriceLabel } from "@/utils/Util";

function getFirstAsset(product) {
  return product?.assets?.length ? product.assets[0].path : "";
}

export function getProductGridCardProps(product) {
  const asset = product?.assets?.[0];
  return {
    href: `/product/${product?.slug || product?._id || ""}`,
    src: asset?.path || getFirstAsset(product),
    alt: asset?.altText || product?.name || "",
    name: product?.name || "",
    price: getProductPriceLabel(product?.variants, product?.discountedPrice),
  };
}

export default function ProductGridCard({ product, href, src, alt, name, price }) {
  const card = product
    ? getProductGridCardProps(product)
    : { href, src, alt, name, price };

  if (!card?.href || card.href === "/product/") return null;

  return (
    <Link href={card.href} className="curated-card">
      <div className="curated-imageWrapper">
        {card.src ? (
          <Image
            src={card.src}
            alt={card.alt}
            fill
            className="curated-image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="curated-imagePlaceholder" aria-hidden />
        )}
      </div>
      <div className="curated-meta">
        <p className="curated-name">{card.name}</p>
        <p className="curated-price">{card.price}</p>
      </div>
    </Link>
  );
}
