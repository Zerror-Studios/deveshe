import ProductListing from "@/components/shop/ProductListing";
import ProductListMobile from "@/components/shop/ProductListMobile";
import Section2 from "@/components/shop/Section2";
import Section3 from "@/components/shop/Section3";
import Section4 from "@/components/shop/Section4";
import React from "react";

const Home = () => {
  return <>
    <Section3 />
    <Section2 />
    <ProductListing/>
    <ProductListMobile/>
    <Section4 />
  </>
};

export default Home;
