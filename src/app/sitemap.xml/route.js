/**
 * /sitemap.xml (PRD-014 FR-2.8, UX-33; was `pages/sitemap.xml.js`, now a
 * route handler, kit PRD-002 FR-3.1)
 *
 * The public pages, every storefront category and the published products,
 * read on the server from the catalog. Capped at `SITEMAP_PRODUCT_LIMIT`
 * products (pages of `SITEMAP_PAGE_SIZE`, the backend's page cap) so one
 * request never walks an unbounded catalog, and cached at the edge for
 * `SITEMAP_CACHE_SECONDS`. A catalog failure still serves the static pages.
 */

import {
  createServerCatalogClient,
  fetchCategories,
} from "@/lib/catalog-listing.server";
import { getLookbooks } from "@zcom/storefront-kit/server";
import { GET_SITEMAP_PRODUCTS } from "@/graphql";
import { Const, ProductStatus } from "@/utils/Constant";
import { buildSitemapXml, toLastModified } from "@/utils/sitemap.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SITEMAP_PAGE_SIZE = 100;
const SITEMAP_PRODUCT_LIMIT = 1000;
const SITEMAP_CACHE_SECONDS = 3600;
const SITEMAP_LOOKBOOK_LIMIT = 50;

// `/lookbook` is listed only while at least one lookbook is published
// (otherwise it is a "Coming soon" page).
const STATIC_PATHS = [
  "/",
  "/products",
  "/about",
  "/contact",
  "/shipping-returns",
  "/privacy-policy",
  "/terms-of-service",
];

// ─── Helpers ──────────────────────────────────────────────────────────────

const toUrl = (path) => `${Const.ClientLink}${path === "/" ? "/" : path}`;

async function fetchProductEntries(client) {
  const entries = [];
  for (
    let offset = 0;
    offset < SITEMAP_PRODUCT_LIMIT;
    offset += SITEMAP_PAGE_SIZE
  ) {
    const { data } = await client.query({
      query: GET_SITEMAP_PRODUCTS,
      variables: {
        offset,
        limit: SITEMAP_PAGE_SIZE,
        filters: { status: ProductStatus.PUBLISHED },
      },
    });
    const page = data?.getClientSideProducts;
    const products = page?.products || [];
    products
      .filter((product) => product?.slug)
      .forEach((product) =>
        entries.push({
          loc: toUrl(`/product/${encodeURIComponent(product.slug)}`),
          lastmod: toLastModified(product.updatedAt),
        }),
      );
    if (
      products.length < SITEMAP_PAGE_SIZE ||
      offset + SITEMAP_PAGE_SIZE >= (page?.totalCount || 0)
    ) {
      break;
    }
  }
  return entries;
}

// Per request (the catalog changes); the CDN caches it.
export const dynamic = "force-dynamic";

// ─── Route ────────────────────────────────────────────────────────────────

export async function GET() {
  const entries = STATIC_PATHS.map((path) => ({ loc: toUrl(path) }));
  try {
    const client = createServerCatalogClient();
    const [categories, products, lookbooks] = await Promise.allSettled([
      fetchCategories(client),
      fetchProductEntries(client),
      getLookbooks({ limit: SITEMAP_LOOKBOOK_LIMIT }),
    ]);
    if (categories.status === "fulfilled") {
      categories.value.forEach((category) =>
        entries.push({
          loc: toUrl(`/category/${encodeURIComponent(category.slug)}`),
        }),
      );
    }
    if (products.status === "fulfilled") entries.push(...products.value);
    const published =
      lookbooks.status === "fulfilled" ? lookbooks.value.lookbooks : [];
    if (published.length) {
      entries.push({ loc: toUrl("/lookbook") });
      published.forEach((lookbook) =>
        entries.push({
          loc: toUrl(`/lookbook/${encodeURIComponent(lookbook.slug)}`),
          lastmod: toLastModified(lookbook.publishedAt),
        }),
      );
    }
  } catch (error) {
    console.error("Sitemap catalog read failed:", error.message);
  }

  return new Response(buildSitemapXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${SITEMAP_CACHE_SECONDS}, stale-while-revalidate=${SITEMAP_CACHE_SECONDS}`,
    },
  });
}
