import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import {
  createServerCatalogClient,
  fetchProductPage,
} from "@/lib/catalog-listing.server";
import { GET_REVIEWS } from "@/graphql";
import { pickHomeReviews } from "@/utils/review.util";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ReviewSection from "@/components/home/ReviewSection";

// PRD-014 FR-0.8: the home shows the newest published products (one large
// card + a grid of ten) and links to /products for the rest.
const HOME_FEATURED_LIMIT = 11;
// PRD-014 FR-0.9 (UX-35): up to four approved reviews with a comment.
const HOME_REVIEW_LIMIT = 4;
const HOME_REVIEW_FETCH_LIMIT = 12;

const Home = ({ meta, productData, productTotal, productError, reviews }) => {
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
      <ProductSection
        sectionRef={sectionRef}
        data={productData}
        totalCount={productTotal}
        loadError={productError}
      />
      <VisionSection />
      <ReviewSection reviews={reviews} />
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

  const client = createServerCatalogClient();
  // PRD-032 FR-D6: reviews the store pinned first, else the latest ones.
  const [productResult, reviewResult, featuredResult] = await Promise.allSettled([
    fetchProductPage(client, { limit: HOME_FEATURED_LIMIT }),
    client.query({
      query: GET_REVIEWS,
      variables: { offset: 0, limit: HOME_REVIEW_FETCH_LIMIT },
    }),
    client.query({
      query: GET_REVIEWS,
      variables: {
        offset: 0,
        limit: HOME_REVIEW_FETCH_LIMIT,
        filter: { featured: true },
      },
    }),
  ]);
  if (productResult.status === "rejected") {
    console.error("Home products failed:", productResult.reason?.message);
  }
  // Reviews are optional: without them the section is simply not shown.
  const reviews = pickHomeReviews(
    featuredResult.value?.data?.getReviews?.data,
    reviewResult.value?.data?.getReviews?.data,
    HOME_REVIEW_LIMIT,
  );

  return {
    props: {
      meta,
      productData: productResult.value?.products || [],
      productTotal: productResult.value?.totalCount || 0,
      productError: productResult.status === "rejected",
      reviews,
    },
  };
}
