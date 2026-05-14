"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { GET_CLIENT_SIDE_CATEGORIES } from "@/graphql";

/** Temporary fallbacks when `imgsrc` is missing from the API (rotate by row). */
const CATEGORY_IMAGE_FALLBACKS = [
  "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2F8c865d22dd%2Fall-clothing.png&w=3840&q=90",
  "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2142x3000%2F4acc9c1444%2F016_ark8_bj040er_front_fixed.png&w=3840&q=90",
  "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2F01f877b2ca%2Fdresses.png&w=3840&q=90",
  "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2Fbb58a01871%2Ftops-t-shirts.png&w=3840&q=90",
  "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F240x320%2F594975e2e1%2Fsweatshirts.png&w=3840&q=90",
];

export default function CategoryExplore({ headingtitle }) {
  const { data } = useQuery(GET_CLIENT_SIDE_CATEGORIES, {
    variables: { offset: 0, limit: 50 },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const categories = data?.getClientSideCategories?.categories ?? [];

  return (
    <section className="category-container">
      <p className="category-heading">{headingtitle ?? "Featured Collection"}</p>

      <div className="category-row">
        {categories.map((cat, index) => {
          const src = CATEGORY_IMAGE_FALLBACKS[index % CATEGORY_IMAGE_FALLBACKS.length];
          const href = cat?.slug ? `/shop/${cat.slug}` : "/shop";
          return (
            <Link
              key={cat._id}
              href={href}
              className="category-card category-card-link"
            >
              <div className="category-image">
                <Image
                  src={src}
                  alt={cat?.name || "Category"}
                  width={40}
                  height={52}
                  className="category-image-img"
                />
              </div>
              <p className="category-name">{cat?.name}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
