"use client";
import Link from "next/link";
import Image from "next/image";
import { SHOP_NAV_LINKS } from "@/helpers/MenuData";


export default function CategoryExplore({ headingtitle, excludeSlug }) {
  const categories = SHOP_NAV_LINKS.filter((item) => {
    if (item.link === "/shop") return false;
    if (!excludeSlug) return true;
    const slug = item.link.replace("/shop/", "");
    return slug !== excludeSlug;
  });

  return (
    <section className="category-container">
      <p className="category-heading">{headingtitle ?? "Featured Collection"}</p>

      <div className="category-row">
        {categories.map((cat) => {
          const imageSrc = cat.imgsrc
            ? cat.imgsrc.split("/").map(encodeURIComponent).join("/")
            : null;
          return (
            <Link
              key={cat.link}
              href={cat.link}
              className="category-card category-card-link"
            >
              <div className="category-image">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={cat.name}
                    width={40}
                    height={52}
                    className="category-image-img"
                    sizes="40px"
                    unoptimized
                  />
                ) : null}
              </div>
              <p className="category-name">{cat.name}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
