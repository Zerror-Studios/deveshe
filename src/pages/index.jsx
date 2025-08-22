import React, { Suspense, useRef } from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_PRODUCTS } from "@/graphql";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ProductLoader from "@/components/loaders/ProductLoader";

const Home = ({ meta, productData }) => {
   const sectionRef = useRef(null);
  return (
    <>
      <SeoHeader meta={meta} />
      <HeroSection />
      <ExploreSection sectionRef={sectionRef} />
      <Suspense fallback={<ProductLoader />}>
        <ProductSection sectionRef={sectionRef} data={productData} />
      </Suspense>
      <VisionSection />
    </>
  );
};

export default Home;

export async function getServerSideProps() {
  const meta = {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "DeVeSheDreams is a fashion label that turns dreams into wearable art. Collaborating with artists from different disciplines, we create capsule collections that reflect vibrant expression and individuality.",
    keywords:
      "DeVeSheDreams, wearable art, capsule collections, fashion collaborations, expressive clothing, artistic fashion",
    author: "DeVeSheDreams",
    robots: "index,follow",
  };
  try {
    const client = createApolloClient();
    const { data } = await client.query({
      query: GET_PRODUCTS,
      variables: {
        offset: 0,
        limit: 11,
      },
    });
    return {
      props: {
        meta: meta,
        productData: data?.getClientSideProducts?.products || [],
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      props: {
        meta: meta,
        productData: [],
      },
    };
  }
}
