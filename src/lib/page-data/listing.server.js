/**
 * Listing page data — SERVER ONLY (kit PRD-002 FR-3.1): the
 * `getServerSideProps` of `pages/products`, `pages/category/[slug]` and
 * `pages/search`, unchanged.
 *
 * - `/products` (PRD-014 FR-0.8, UX-01 / D9): every published product,
 *   newest first unless `?sort=` asks otherwise (W2-STORE), 12 per page
 *   with "Load more", plus the category chips.
 * - `/category/<slug>` resolves the category with `getClientSideCategories`
 *   (`filter.slug`; special categories are never public). An unknown slug
 *   is a real 404; a failed product load renders an error state.
 * - `/search?q=…` (PRD-014 FR-2.8, UX-28) searches published products by
 *   name, description and SKU; `noindex, follow`, canonical without query.
 */

import { LISTING_PAGE_SIZE } from "@/components/listing/listing.constants";
import {
  createServerCatalogClient,
  fetchCategories,
  fetchProductPage,
  toListingFilters,
} from "@/lib/catalog-listing.server";
import { Const } from "@/utils/Constant";
import { parseListingSort } from "@/utils/listing-sort.util";
import {
  SEARCH_TERM_MIN_LENGTH,
  toSearchTerm,
} from "@/utils/search-term.util";

// ─── Constants ────────────────────────────────────────────────────────────

const PRODUCTS_TITLE = "Shop All – DeVeSheDreams";
const PRODUCTS_DESCRIPTION =
  "Shop every DeVeSheDreams piece: wearable art from capsule collections made with artists across disciplines.";
const SEARCH_TITLE = "Search – DeVeSheDreams";

// ─── /products ────────────────────────────────────────────────────────────

export async function loadProductsPage(query) {
  const sort = parseListingSort(query?.sort);
  const meta = {
    title: PRODUCTS_TITLE,
    description: PRODUCTS_DESCRIPTION,
    keywords: "DeVeSheDreams, shop, wearable art, capsule collections",
    author: "DeVeSheDreams",
    robots: "index, follow",
    // Query strings never change the first page, so never canonicalise them.
    canonical: `${Const.ClientLink}/products`,
    og: { title: PRODUCTS_TITLE, description: PRODUCTS_DESCRIPTION },
    twitter: {
      card: "summary_large_image",
      title: PRODUCTS_TITLE,
      description: PRODUCTS_DESCRIPTION,
    },
  };
  const filters = toListingFilters();
  const client = createServerCatalogClient();
  const [productResult, categoryResult] = await Promise.allSettled([
    fetchProductPage(client, {
      filters,
      sort,
      limit: LISTING_PAGE_SIZE,
    }),
    fetchCategories(client),
  ]);
  if (productResult.status === "rejected") {
    console.error("Products page load failed:", productResult.reason?.message);
  }

  return {
    props: {
      meta,
      filters,
      sort,
      products: productResult.value?.products || [],
      totalCount: productResult.value?.totalCount || 0,
      categories: categoryResult.value || [],
      loadError: productResult.status === "rejected",
    },
  };
}

// ─── /category/[slug] ─────────────────────────────────────────────────────

const getUnavailableProps = (slug, sort) => ({
  meta: {
    title: "Shop – DeVeSheDreams",
    description: "This collection is temporarily unavailable.",
    robots: "noindex, nofollow",
    canonical: `${Const.ClientLink}/category/${encodeURIComponent(slug)}`,
  },
  filters: {},
  sort,
  category: { _id: "", name: "Shop", slug, description: "" },
  products: [],
  totalCount: 0,
  categories: [],
  loadError: true,
});

export async function loadCategoryPage(params, query) {
  const sort = parseListingSort(query?.sort);
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!slug) return { notFound: true };

  const client = createServerCatalogClient();
  let category = null;
  try {
    [category] = await fetchCategories(client, { slug });
  } catch (error) {
    // The API is down: an error state (not indexed), never a fake 404.
    console.error("Category lookup failed:", error?.message);
    return { props: getUnavailableProps(slug, sort) };
  }
  if (!category || category.slug !== slug) return { notFound: true };

  const filters = toListingFilters({ categoryIds: [category._id] });
  const [productResult, categoryResult] = await Promise.allSettled([
    fetchProductPage(client, {
      filters,
      sort,
      limit: LISTING_PAGE_SIZE,
    }),
    fetchCategories(client),
  ]);
  if (productResult.status === "rejected") {
    console.error("Category page load failed:", productResult.reason?.message);
  }

  const title = `${category.seo?.title || category.name} – DeVeSheDreams`;
  const description =
    category.seo?.description ||
    category.description ||
    `Shop ${category.name} at DeVeSheDreams: wearable art from capsule collections made with artists.`;
  const meta = {
    title,
    description,
    keywords: `DeVeSheDreams, ${category.name}, wearable art`,
    author: "DeVeSheDreams",
    robots: "index, follow",
    canonical: `${Const.ClientLink}/category/${encodeURIComponent(slug)}`,
    og: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };

  return {
    props: {
      meta,
      filters,
      sort,
      category: {
        _id: category._id,
        name: category.name || "",
        slug: category.slug,
        description: category.description || "",
      },
      products: productResult.value?.products || [],
      totalCount: productResult.value?.totalCount || 0,
      categories: categoryResult.value || [],
      loadError: productResult.status === "rejected",
    },
  };
}

// ─── /search ──────────────────────────────────────────────────────────────

export async function loadSearchPage(query) {
  const term = toSearchTerm(query?.q);
  const sort = parseListingSort(query?.sort);
  const meta = {
    title: term ? `“${term}” – ${SEARCH_TITLE}` : SEARCH_TITLE,
    description: "Search DeVeSheDreams wearable art.",
    author: "DeVeSheDreams",
    robots: "noindex, follow",
    canonical: `${Const.ClientLink}/search`,
    og: { title: SEARCH_TITLE },
    twitter: { card: "summary_large_image", title: SEARCH_TITLE },
  };
  const filters = toListingFilters(term ? { search: term } : {});
  const base = { meta, term, filters, sort };
  if (term.length < SEARCH_TERM_MIN_LENGTH) {
    return {
      props: { ...base, products: [], totalCount: 0, loadError: false },
    };
  }

  try {
    const client = createServerCatalogClient();
    const page = await fetchProductPage(client, {
      filters,
      sort,
      limit: LISTING_PAGE_SIZE,
    });
    return {
      props: {
        ...base,
        products: page.products,
        totalCount: page.totalCount,
        loadError: false,
      },
    };
  } catch (error) {
    console.error("Search failed:", error.message);
    return {
      props: { ...base, products: [], totalCount: 0, loadError: true },
    };
  }
}
