/**
 * Home page data — SERVER ONLY (was `getServerSideProps` of `pages/index.jsx`).
 *
 * PRD-014 FR-0.8: the newest published products (one large card + a grid
 * of ten); FR-0.9 (UX-35): up to four approved reviews with a comment,
 * the ones the store pinned first (PRD-032 FR-D6).
 */

import {
  createServerCatalogClient,
  fetchProductPage,
} from "@/lib/catalog-listing.server";
import { GET_REVIEWS } from "@/graphql";
import { pickHomeReviews } from "@/utils/review.util";

// ─── Constants ────────────────────────────────────────────────────────────

const HOME_FEATURED_LIMIT = 11;
const HOME_REVIEW_LIMIT = 4;
const HOME_REVIEW_FETCH_LIMIT = 12;

export const HOME_META = {
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
    "handcrafted fashion",
  ],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "DeVeSheDreams collaborates with multi-disciplinary artists to create expressive, imaginative capsule collections that bring art to life through fashion.",
  },
  twitter: {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "Discover wearable art and expressive fashion with DeVeSheDreams. Crafted through creative collaborations and bold artistic vision.",
    card: "summary_large_image",
  },
};

// ─── Loader ───────────────────────────────────────────────────────────────

export async function loadHomePage() {
  const client = createServerCatalogClient();
  const [productResult, reviewResult, featuredResult] =
    await Promise.allSettled([
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
    productData: productResult.value?.products || [],
    productTotal: productResult.value?.totalCount || 0,
    productError: productResult.status === "rejected",
    reviews,
  };
}
