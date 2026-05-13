"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ReviewSection from "@/components/home/ReviewSection";
import HeroSectionHome from "@/components/home/HeroSectionHome";
import CuratedProducts from "@/components/home/CuratedProducts";
import CategoryExplore from "@/components/home/CategoryExplore";
import FeaturedArticle from "@/components/home/FeaturedArticle";

export default function HomeClient({ productData }) {
  const sectionRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = () => {
      const targetId = window.location.hash?.replace("#", "");
      if (!targetId) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  return (
    <>
      <HeroSectionHome />
      <CuratedProducts products={productData.slice(0, 8)} />
      <CategoryExplore />
      <FeaturedArticle />
      {/* <HeroSection /> */}
      {/* <ExploreSection sectionRef={sectionRef} /> */}
      {/* <ProductSection sectionRef={sectionRef} data={productData} /> */}
      {/* <VisionSection /> */}
      <ReviewSection />
    </>
  );
}

