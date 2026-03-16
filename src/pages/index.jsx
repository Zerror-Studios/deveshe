import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_PRODUCTS } from "@/graphql";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ReviewSection from "@/components/home/ReviewSection";
import { ProductStatus } from "@/utils/Constant";

const Home = ({ meta, productData }) => {
  const sectionRef = useRef(null);
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;

    const scrollToHash = () => {
      const targetId = window.location.hash?.replace("#", "");
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          // small delay ensures DOM is painted
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 500);
        }
      }
    };

    // 1️⃣ Run after mount
    scrollToHash();

    // 2️⃣ Run again when route changes
    router.events.on("routeChangeComplete", scrollToHash);

    // 3️⃣ Run again when hash changes (user clicks same-page anchor)
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      router.events.off("routeChangeComplete", scrollToHash);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [router.isReady, router.events]);

  return (
    <>
      <SeoHeader meta={meta} />
      <HeroSection />
      <ExploreSection sectionRef={sectionRef} />
      <ProductSection sectionRef={sectionRef} data={productData} />
      <VisionSection />
      <ReviewSection />
    </>
  );
};

export default Home;

export async function getServerSideProps() {
  const meta = {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "DeVeSheDreams is a fashion label that transforms creativity into wearable art. Through collaborative capsule collections crafted with artists across diverse disciplines, we celebrate individuality, expression, and bold personal style.",
    keywords: [
      "DeVeSheDreams",
      "wearable art",
      "capsule collections",
      "fashion collaborations",
      "expressive clothing",
      "artistic fashion",
      "creative apparel",
      "handcrafted fashion"
    ],
    primaryKeywords: [
      "DeVeSheDreams",
      "wearable art",
      "capsule collections"
    ],
    author: "DeVeSheDreams",
    robots: "index, follow",
    og: {
      title: "DeVeSheDreams – Wear Your Imagination",
      description:
        "DeVeSheDreams collaborates with multi-disciplinary artists to create expressive, imaginative capsule collections that bring art to life through fashion."
    },
    twitter: {
      title: "DeVeSheDreams – Wear Your Imagination",
      description:
        "Discover wearable art and expressive fashion with DeVeSheDreams. Crafted through creative collaborations and bold artistic vision.",
      card: "summary_large_image"
    }
  };

  try {
    const client = createApolloClient();
    const { data } = await client.query({
      query: GET_PRODUCTS,
      variables: {
        offset: 0,
        limit: 1000,
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
