/**
 * Home page data — SERVER ONLY (was `getServerSideProps` of `pages/index.jsx`).
 *
 * The live design (main, 2026-05): "Top Picks" are the first eight
 * published products of the curated collection (resolved by its slug, so a
 * renamed id never breaks it), "Latest Blogs" the newest published post.
 * PRD-014 FR-0.9 (UX-35): up to four approved reviews with a comment, the
 * ones the store pinned first (PRD-032 FR-D6). Every part is optional: a
 * failed read leaves its section empty or hidden, never the page.
 */

import {
  createServerCatalogClient,
  curatedListingFilters,
  fetchProductPage,
} from "@/lib/catalog-listing.server";
import { GET_CLIENT_SIDE_BLOGS, GET_REVIEWS } from "@/graphql";
import { mapBlogForListing } from "@/data/blogs";
import { pickHomeReviews } from "@/utils/review.util";

// ─── Constants ────────────────────────────────────────────────────────────

const HOME_CURATED_LIMIT = 8;
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

/** The curated collection's first products; [] when it can't be read. */
const loadCuratedProducts = async (client) => {
  // Without the collection, the newest published products stand in.
  const filters = await curatedListingFilters(client);
  const page = await fetchProductPage(client, {
    filters,
    limit: HOME_CURATED_LIMIT,
  });
  return page.products;
};

export async function loadHomePage() {
  const client = createServerCatalogClient();
  const [productResult, blogResult, reviewResult, featuredResult] =
    await Promise.allSettled([
      loadCuratedProducts(client),
      client.query({
        query: GET_CLIENT_SIDE_BLOGS,
        variables: { limit: 1, offset: 0 },
      }),
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
    productData: productResult.value || [],
    latestBlog: mapBlogForListing(
      blogResult.value?.data?.getClientSideBlogs?.blogs?.[0],
    ),
    reviews,
  };
}
