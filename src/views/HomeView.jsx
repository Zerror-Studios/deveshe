"use client";

/**
 * Home (was `pages/index.jsx`), in the live site's design (main, 2026-05):
 * the four-collection hero, Top Picks, the collection row, the latest blog
 * post and the reviews. Data comes from `lib/page-data/home.server.js`.
 */

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import HeroSectionHome from "@/components/home/HeroSectionHome";
import CuratedProducts from "@/components/home/CuratedProducts";
import CategoryExplore from "@/components/home/CategoryExplore";
import FeaturedArticle from "@/components/home/FeaturedArticle";
import ReviewSection from "@/components/home/ReviewSection";

// ─── Constants ────────────────────────────────────────────────────────────

// Lets the page paint before scrolling to `#shop` and the other anchors.
const HASH_SCROLL_DELAY_MS = 500;

// ─── View ─────────────────────────────────────────────────────────────────

const Home = ({ productData = [], latestBlog = null, reviews = [] }) => {
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
      <HeroSectionHome />
      <CuratedProducts products={productData} />
      <CategoryExplore />
      <FeaturedArticle blog={latestBlog} />
      <ReviewSection reviews={reviews} />
    </>
  );
};

export default Home;
