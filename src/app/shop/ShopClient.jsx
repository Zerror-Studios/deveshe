import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection from "@/components/shop/HeroSection";
import React from "react";

export const SHOP_DEFAULT_HERO_IMAGE =
  "/assets/images/home/shop page.webp";


const ShopClient = ({ productData }) => {

  return (
    <>
      <HeroSection heroImageSrc={SHOP_DEFAULT_HERO_IMAGE} isDefault={true}/>
      <CuratedProducts products={productData} isShop={true} />
      <CategoryExplore />
    </>
  );
};

export default ShopClient;