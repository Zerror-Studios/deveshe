import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection from "@/components/shop/HeroSection";
import { ShopFilterProvider } from "@/context/ShopFilterContext";
import React from "react";

const CategoriesClient = ({
  productData,
  categories = [],
  lookbooks = [],
  heroImageSrc,
  categoryName,
  categoryDescription,
  currentCategorySlug,
}) => {
  return (
    <ShopFilterProvider
      products={productData}
      categories={categories}
      lookbooks={lookbooks}
      hideProductType
    >
      <HeroSection
        heroImageSrc={heroImageSrc}
        categoryName={categoryName}
        categoryDescription={categoryDescription}
      />
      <CuratedProducts categoryName={categoryName} isShop={true} />
      <CategoryExplore
        headingtitle={"Are you looking for something else?"}
        excludeSlug={currentCategorySlug}
      />
    </ShopFilterProvider>
  );
};

export default CategoriesClient;
