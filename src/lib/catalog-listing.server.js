/**
 * Catalog listing reads for server rendering (PRD-014 FR-0.8) — SERVER ONLY
 *
 * Used by the server loaders in `lib/page-data/` (`/`, `/products`,
 * `/category/[slug]`, `/product/[slug]`) and the sitemap route. Reads go
 * through the kit's `zcomFetch` with the edge headers (`lib/server-query.js`),
 * so import this module only from server files (server pages, route
 * handlers and the page-data loaders), never from a "use client" file.
 */

import { createServerQueryClient } from "@/lib/server-query";
import { GET_CATEGORIES, GET_PRODUCTS } from "@/graphql";
import {
  toListingFilters,
  toProductPageVariables,
} from "@/utils/catalog-listing.util";

// ─── Constants ────────────────────────────────────────────────────────────

/** Category chips on the listing pages (backend list cap is 100). */
const LISTING_CATEGORY_LIMIT = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Anonymous, never cached (the pages render per request). */
export const createServerCatalogClient = () => createServerQueryClient();

export { toListingFilters };

/**
 * One page of `getClientSideProducts`: `{ products, totalCount }`, in the
 * listing's `sort` (W2-STORE; the default NEWEST is not sent).
 */
export const fetchProductPage = async (
  client,
  { filters = {}, limit, offset = 0, sort },
) => {
  const { data } = await client.query({
    query: GET_PRODUCTS,
    variables: toProductPageVariables({ filters, limit, offset, sort }),
  });
  const page = data?.getClientSideProducts;
  return {
    products: page?.products || [],
    totalCount: page?.totalCount || 0,
  };
};

/** Storefront categories with a slug (special categories are excluded). */
export const fetchCategories = async (client, filter) => {
  const { data } = await client.query({
    query: GET_CATEGORIES,
    variables: {
      offset: 0,
      limit: filter?.slug ? 1 : LISTING_CATEGORY_LIMIT,
      ...(filter ? { filter } : {}),
    },
  });
  return (data?.getClientSideCategories?.categories || []).filter(
    (category) => category?._id && category?.slug,
  );
};

// ─── Curated collection ───────────────────────────────────────────────────

/**
 * The collection the live site shows as "Top Picks" on `/` and `/shop`
 * (it hard-coded its id; found here by slug).
 */
export const CURATED_CATEGORY_SLUG = "basically-iconic";

/** Listing filters for the curated collection; every product without it. */
export async function curatedListingFilters(client) {
  const [category] = await fetchCategories(client, {
    slug: CURATED_CATEGORY_SLUG,
  }).catch(() => []);
  return toListingFilters(
    category?._id ? { categoryIds: [category._id] } : {},
  );
}
