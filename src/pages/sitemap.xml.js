/**
 * /sitemap.xml (PRD-014 FR-2.8, UX-33)
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
import { GET_SITEMAP_PRODUCTS } from "@/graphql";
import { Const, ProductStatus } from "@/utils/Constant";
import { buildSitemapXml, toLastModified } from "@/utils/sitemap.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SITEMAP_PAGE_SIZE = 100;
const SITEMAP_PRODUCT_LIMIT = 1000;
const SITEMAP_CACHE_SECONDS = 3600;

// `/lookbook` is a "Coming soon" page today, so it is not listed.
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

// ─── Route ────────────────────────────────────────────────────────────────

export async function getServerSideProps({ res }) {
  const entries = STATIC_PATHS.map((path) => ({ loc: toUrl(path) }));
  try {
    const client = createServerCatalogClient();
    const [categories, products] = await Promise.allSettled([
      fetchCategories(client),
      fetchProductEntries(client),
    ]);
    if (categories.status === "fulfilled") {
      categories.value.forEach((category) =>
        entries.push({
          loc: toUrl(`/category/${encodeURIComponent(category.slug)}`),
        }),
      );
    }
    if (products.status === "fulfilled") entries.push(...products.value);
  } catch (error) {
    console.error("Sitemap catalog read failed:", error.message);
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${SITEMAP_CACHE_SECONDS}, stale-while-revalidate=${SITEMAP_CACHE_SECONDS}`,
  );
  res.write(buildSitemapXml(entries));
  res.end();
  return { props: {} };
}

const Sitemap = () => null;

export default Sitemap;
