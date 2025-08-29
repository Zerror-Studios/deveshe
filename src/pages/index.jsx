import React, { Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_PRODUCTS } from "@/graphql";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ProductLoader from "@/components/loaders/ProductLoader";
import ReviewSection from "@/components/home/ReviewSection";
import { ProductStatus } from "@/utils/Constant";

const Home = ({ meta, productData }) => {
  const sectionRef = useRef(null);
  const router = useRouter();

  const scrollToShop = (delay = 1000) => {
    setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, delay); // delay in milliseconds
  };
  // Run scroll on mount AND whenever route/query changes
  useEffect(() => {
    if (!router.isReady) return;

    const checkAndScroll = () => {
      if (router.query.section === "shop" || window.location.hash === "#shop") {
        scrollToShop();
      }
    };

    // Initial check
    checkAndScroll();

    router.events.on("routeChangeComplete", checkAndScroll);

    return () => {
      router.events.off("routeChangeComplete", checkAndScroll);
    };
  }, [router.isReady, router.query, router.events]);

  return (
    <>
      <SeoHeader meta={meta} />
      <HeroSection />
      <ExploreSection sectionRef={sectionRef} />
      <Suspense fallback={<ProductLoader />}>
        <ProductSection sectionRef={sectionRef} data={productData} />
      </Suspense>
      <VisionSection />
      <ReviewSection />
    </>
  );
};

export default Home;

// getServerSideProps stays the same

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
        filters: {
          categoryIds: ["6898b3cdddf0354e025da816"],
          status: ProductStatus.PUBLISHED,
        },
      },
    });
    return {
      props: {
        meta,
        productData: data?.getClientSideProducts?.products || [],
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      props: {
        meta,
        productData: [],
      },
    };
  }
}
