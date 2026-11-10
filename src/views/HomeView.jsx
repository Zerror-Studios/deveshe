"use client";

/**
 * Home (was `pages/index.jsx`). Data comes from `lib/page-data/home.server.js`.
 */

import React, { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import HeroSection from "@/components/home/HeroSection";
import ExploreSection from "@/components/home/ExploreSection";
import VisionSection from "@/components/home/VisionSection";
import ProductSection from "@/components/home/ProductSection";
import ReviewSection from "@/components/home/ReviewSection";

// ─── Constants ────────────────────────────────────────────────────────────

// Lets the page paint before scrolling to `#shop` and the other anchors.
const HASH_SCROLL_DELAY_MS = 500;

// ─── View ─────────────────────────────────────────────────────────────────

const Home = ({ productData, productTotal, productError, reviews }) => {
  const sectionRef = useRef(null);
  const pathname = usePathname();

  // Scroll to the URL's #anchor after mount, after a navigation back to
  // the home page, and when the hash changes on the page.
  useEffect(() => {
    const scrollToHash = () => {
      const targetId = window.location.hash?.replace("#", "");
      if (!targetId) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, HASH_SCROLL_DELAY_MS);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  return (
    <>
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
