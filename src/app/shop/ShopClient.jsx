import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection from "@/components/shop/HeroSection";
import { ShopFilterProvider } from "@/context/ShopFilterContext";
import React from "react";

export const SHOP_DEFAULT_HERO_IMAGE =
  "/assets/images/home/shop page.webp";


const ShopClient = ({ productData, categories = [], lookbooks = [] }) => {

  return (
    <ShopFilterProvider
      products={productData}
      categories={categories}
      lookbooks={lookbooks}
    >
      <HeroSection heroImageSrc={SHOP_DEFAULT_HERO_IMAGE} isDefault={true} />
      <CuratedProducts isShop={true} />
      <CategoryExplore />
    </ShopFilterProvider>
  );
};

export default ShopClient;