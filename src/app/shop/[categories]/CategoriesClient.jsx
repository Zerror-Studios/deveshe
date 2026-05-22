import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection from "@/components/shop/HeroSection";
import React from "react";

const CategoriesClient = ({
  productData,
  heroImageSrc,
  categoryName,
  categoryDescription,
  currentCategorySlug,
}) => {
  return (
    <>
      <HeroSection heroImageSrc={heroImageSrc} categoryName={categoryName} categoryDescription={categoryDescription} />
      <CuratedProducts
        products={productData}
        categoryName={categoryName}
        isShop={true}
      />
      <CategoryExplore
        headingtitle={"Are you looking for something else?"}
        excludeSlug={currentCategorySlug}
      />
    </>
  );
};

export default CategoriesClient;
