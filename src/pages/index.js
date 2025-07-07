import SeoHeader from "@/components/seo/SeoHeader";
import ProductListing from "@/components/shop/ProductListing";
import ProductListMobile from "@/components/shop/ProductListMobile";
import Section2 from "@/components/shop/Section2";
import Section3 from "@/components/shop/Section3";
import Section4 from "@/components/shop/Section4";
import React from "react";

const Home = ({ meta }) => {
  return <>
    <SeoHeader meta={meta} />
    <Section3 />
    <Section2 />
    <ProductListing />
    <ProductListMobile />
    <Section4 />
  </>
};

export default Home;

export async function getStaticProps() {
  const meta = {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "DeVeSheDreams is a fashion label that turns dreams into wearable art. Collaborating with artists from different disciplines, we create capsule collections that reflect vibrant expression and individuality.",
    keywords: "DeVeSheDreams, wearable art, capsule collections, fashion collaborations, expressive clothing, artistic fashion",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  return { props: { meta } };
}

