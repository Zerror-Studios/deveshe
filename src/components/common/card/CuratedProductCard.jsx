import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function CuratedProductCard({ href, src, alt, name, price }) {
  return (
    <Link href={href} className="curated-card">
      <div className="curated-imageWrapper">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="curated-image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="curated-imagePlaceholder" aria-hidden />
        )}

        <div className="curated-overlay">
          <p className="curated-name">{name}</p>
          <p className="curated-price">{price}</p>
        </div>
      </div>
    </Link>
  );
}

