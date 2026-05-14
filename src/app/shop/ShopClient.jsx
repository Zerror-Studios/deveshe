import CategoryExplore from "@/components/home/CategoryExplore";
import CuratedProducts from "@/components/home/CuratedProducts";
import HeroSection from "@/components/shop/HeroSection";
import React from "react";

export const SHOP_DEFAULT_HERO_IMAGE =
  "https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2250x1266%2Ffe9b1c412b%2Fjacket-ban-2.jpg&w=1920&q=90";


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