import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection from "@/components/shop/HeroSection";
import React from "react";

const CategoriesClient = ({
  productData,
  heroImageSrc,
  categoryName,
}) => {
  return (
    <>
      <HeroSection heroImageSrc={heroImageSrc} categoryName={categoryName} />
      <CuratedProducts
        products={productData}
        categoryName={categoryName}
        isShop={true}
      />
      <CategoryExplore headingtitle={"Are you looking for something else?"} />
    </>
  );
};

export default CategoriesClient;
