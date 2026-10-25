/**
 * Catalog listing reads for server rendering (PRD-014 FR-0.8) — SERVER ONLY
 *
 * Used by `getServerSideProps` of `/`, `/products`, `/category/[slug]` and
 * `/product/[slug]`. Each call builds the server Apollo client with the
 * edge headers, so import this module only from `getServerSideProps` (Next
 * strips it from the browser bundle there).
 */

import { createApolloClient } from "@/lib/apolloClient";
import { getEdgeSecretHeaders } from "@/lib/edge-headers.server";
import { GET_CATEGORIES, GET_PRODUCTS } from "@/graphql";
import {
  toListingFilters,
  toProductPageVariables,
} from "@/utils/catalog-listing.util";

// ─── Constants ────────────────────────────────────────────────────────────

/** Category chips on the listing pages (backend list cap is 100). */
const LISTING_CATEGORY_LIMIT = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────

export const createServerCatalogClient = () =>
  createApolloClient({ headers: getEdgeSecretHeaders() });

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
