import ShopAll from "@/components/collections/ShopAll";
import Section2 from "@/components/shop/Section2";
import Section3 from "@/components/shop/Section3";
import Section4 from "@/components/shop/Section4";
import React from "react";
import ProductListing from "../../components/shop/ProductListing";

const Shop = () => {
  return <>
    <Section3 />
    <Section2 />
    <ProductListing/>
    {/* <ShopAll /> */}
    <Section4 />
  </>
};

export default Shop;
