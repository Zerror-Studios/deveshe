"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ReviewSection from "@/components/home/ReviewSection";

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
      <HeroSection />
      <ExploreSection sectionRef={sectionRef} />
      <ProductSection sectionRef={sectionRef} data={productData} />
      <VisionSection />
      <ReviewSection />
    </>
  );
}

