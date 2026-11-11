/**
 * Shop page data — SERVER ONLY (live site design on the PRD-014 listing
 * data): `/shop` and `/shop/[categories]`.
 *
 * The shop filters, sorts and shows its products on the client (Collection,
 * Product type, Size, price sort), as the live site does, so the loader
 * reads every published product of the page (the shop, or one category),
 * page by page (the API caps a page at 100), up to `SHOP_PRODUCT_CAP`.
 * The Collection filter needs each lookbook's products: the list read has
 * no looks, so each visible lookbook is read once (up to
 * `SHOP_LOOKBOOK_CAP`). Lookbooks are optional: without them the filter is
 * simply not shown. An unknown category slug is a real 404; the API being
 * down is an error state (not indexed), never a fake 404.
 */

import { getLookbook, getLookbooks } from "@zcom/storefront-kit/server";
import {
  createServerCatalogClient,
  curatedListingFilters,
  fetchCategories,
  fetchProductPage,
  toListingFilters,
} from "@/lib/catalog-listing.server";
import { Const } from "@/utils/Constant";

// ─── Constants ────────────────────────────────────────────────────────────

const SHOP_PAGE_SIZE = 100;
const SHOP_PRODUCT_CAP = 500;
const SHOP_LOOKBOOK_CAP = 10;

const SITE_NAME = "DeVeSheDreams";
const SHOP_TITLE = `Shop – ${SITE_NAME}`;
const SHOP_DESCRIPTION =
  "Shop every DeVeSheDreams piece: wearable art from capsule collections made with artists across disciplines.";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Every product of the filters, newest first, up to the cap. */
const fetchAllProducts = async (client, filters) => {
  const first = await fetchProductPage(client, {
    filters,
    limit: SHOP_PAGE_SIZE,
  });
  const products = [...first.products];
  const total = Math.min(first.totalCount, SHOP_PRODUCT_CAP);
  const offsets = [];
  for (let offset = SHOP_PAGE_SIZE; offset < total; offset += SHOP_PAGE_SIZE) {
    offsets.push(offset);
  }
  const pages = await Promise.all(
    offsets.map((offset) =>
      fetchProductPage(client, { filters, limit: SHOP_PAGE_SIZE, offset }),
    ),
  );
  const seen = new Set(products.map((product) => product?._id));
  for (const page of pages) {
    for (const product of page.products) {
      if (seen.has(product?._id)) continue;
      seen.add(product?._id);
      products.push(product);
    }
  }
  return products.slice(0, SHOP_PRODUCT_CAP);
};

/** Every `productId` a lookbook tags (featured, looks, hotspots). */
const collectProductIds = (value, ids = new Set()) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectProductIds(item, ids));
  } else if (value && typeof value === "object") {
    if (typeof value.productId === "string") ids.add(value.productId);
    Object.values(value).forEach((item) => collectProductIds(item, ids));
  }
  return ids;
};

/** `{ name, productIds }` per visible lookbook (the Collection filter). */
const fetchShopLookbooks = async () => {
  try {
    const { lookbooks } = await getLookbooks({ limit: SHOP_LOOKBOOK_CAP });
    const details = await Promise.allSettled(
      lookbooks.map((lookbook) => getLookbook(lookbook.slug)),
    );
    return details
      .map((result) => result.value?.lookbook)
      .filter(Boolean)
      .map((lookbook) => ({
        _id: lookbook._id,
        name: lookbook.title,
        productIds: [...collectProductIds(lookbook)],
      }))
      .filter((lookbook) => lookbook.name && lookbook.productIds.length);
  } catch (error) {
    console.error("Shop lookbooks failed:", error?.message);
    return [];
  }
};

const toShopMeta = ({ title, description, path, robots = "index, follow" }) => ({
  title,
  description,
  keywords: `${SITE_NAME}, shop, wearable art, capsule collections`,
  author: SITE_NAME,
  robots,
  canonical: `${Const.ClientLink}${path}`,
  og: { title, description },
  twitter: { card: "summary_large_image", title, description },
});

// ─── /shop ────────────────────────────────────────────────────────────────

export async function loadShopPage() {
  const client = createServerCatalogClient();
  const [productResult, categoryResult, lookbooks] = await Promise.all([
    // The live /shop lists the curated collection ("Top Picks"), not
    // every product; the category pages list theirs.
    curatedListingFilters(client).then((filters) => fetchAllProducts(client, filters)).then(
      (value) => ({ value }),
      (reason) => ({ reason }),
    ),
    fetchCategories(client).catch(() => []),
    fetchShopLookbooks(),
  ]);
  if (productResult.reason) {
    console.error("Shop page load failed:", productResult.reason?.message);
  }

  return {
    meta: toShopMeta({
      title: SHOP_TITLE,
      description: SHOP_DESCRIPTION,
      path: "/shop",
    }),
    products: productResult.value || [],
    categories: categoryResult,
    lookbooks,
    loadError: Boolean(productResult.reason),
  };
}

// ─── /shop/[categories] ───────────────────────────────────────────────────

export async function loadShopCategoryPage(slug) {
  if (!slug) return { notFound: true };

  const client = createServerCatalogClient();
  let category = null;
  try {
    [category] = await fetchCategories(client, { slug });
  } catch (error) {
    console.error("Category lookup failed:", error?.message);
    return {
      props: {
        meta: toShopMeta({
          title: SHOP_TITLE,
          description: "This collection is temporarily unavailable.",
          path: `/shop/${encodeURIComponent(slug)}`,
          robots: "noindex, nofollow",
        }),
        category: { _id: "", name: "Shop", slug, description: "", imgsrc: "" },
        products: [],
        categories: [],
        lookbooks: [],
        loadError: true,
      },
    };
  }
  if (!category || category.slug !== slug) return { notFound: true };

  const filters = toListingFilters({ categoryIds: [category._id] });
  const [productResult, categoryResult, lookbooks] = await Promise.all([
    fetchAllProducts(client, filters).then(
      (value) => ({ value }),
      (reason) => ({ reason }),
    ),
    fetchCategories(client).catch(() => []),
    fetchShopLookbooks(),
  ]);
  if (productResult.reason) {
    console.error("Category page load failed:", productResult.reason?.message);
  }

  const title = `${category.seo?.title || category.name} – ${SITE_NAME}`;
  const description =
    category.seo?.description ||
    category.description ||
    `Shop ${category.name} at ${SITE_NAME}: wearable art from capsule collections made with artists.`;

  return {
    props: {
      meta: {
        ...toShopMeta({
          title,
          description,
          path: `/shop/${encodeURIComponent(slug)}`,
        }),
        keywords: `${SITE_NAME}, ${category.name}, wearable art`,
      },
      category: {
        _id: category._id,
        name: category.name || "",
        slug: category.slug,
        description: category.description || "",
        imgsrc: category.imgsrc || "",
      },
      products: productResult.value || [],
      categories: categoryResult,
      lookbooks,
      loadError: Boolean(productResult.reason),
    },
  };
}
