"use client";

/**
 * Shop (live site design): `/shop` and `/shop/[categories]`. The hero with
 * the filter strip, the filtered product grid and the other collections.
 * Data comes from `lib/page-data/shop.server.js`; the filters run on the
 * client over the products it read (`context/ShopFilterContext`).
 */

import React from "react";
import { useRouter } from "next/navigation";
import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection, {
  SHOP_DEFAULT_HERO_IMAGE,
} from "@/components/shop/HeroSection";
import { ShopFilterProvider } from "@/context/ShopFilterContext";

// ─── View ─────────────────────────────────────────────────────────────────

const ShopView = ({
  products = [],
  categories = [],
  lookbooks = [],
  category = null,
  loadError = false,
}) => {
  const router = useRouter();
  const categoryName = category?.name || "";

  return (
    <ShopFilterProvider
      products={products}
      categories={categories}
      lookbooks={lookbooks}
      // A category page is already one product type
      hideProductType={Boolean(category)}
    >
      <h1 className="sr-only">{categoryName || "Shop"}</h1>
      {category ? (
        <HeroSection
          heroImageSrc={category.imgsrc || undefined}
          categoryName={categoryName || "Shop"}
          categoryDescription={category.description || ""}
          showFilter={!loadError}
        />
      ) : (
        <HeroSection
          heroImageSrc={SHOP_DEFAULT_HERO_IMAGE}
          isDefault
          showFilter={!loadError}
        />
      )}
      {loadError ? (
        <section className="curated-container is-shop">
          <div className="curated-grid__empty curated-empty" role="alert">
            <p className="curated-empty__message">
              We could not load the collection right now.
            </p>
            <button
              type="button"
              className="listing_button"
              onClick={() => router.refresh()}
            >
              Try again
            </button>
          </div>
        </section>
      ) : (
        <CuratedProducts categoryName={categoryName} isShop />
      )}
      {category ? (
        <CategoryExplore
          headingtitle="Are you looking for something else?"
          excludeSlug={category.slug}
        />
      ) : (
        <CategoryExplore />
      )}
    </ShopFilterProvider>
  );
};

export default ShopView;
