/**
 * Search page data — SERVER ONLY (kit PRD-002 FR-3.1; was the
 * `getServerSideProps` of `pages/search`).
 *
 * `/search?q=…` (PRD-014 FR-2.8, UX-28) searches published products by
 * name, description and SKU; `noindex, follow`, canonical without query.
 * Without a query, or when nothing matches, the page also gets the newest
 * products as suggestions (`suggestions`; empty when that read fails).
 * The shop listings (`/shop`, `/shop/[categories]`) load in
 * `shop.server.js`; `/products` and `/category/<slug>` redirect there.
 */

import { LISTING_PAGE_SIZE } from "@/components/listing/listing.constants";
import {
  createServerCatalogClient,
  fetchProductPage,
  toListingFilters,
} from "@/lib/catalog-listing.server";
import { Const } from "@/utils/Constant";
import {
  DEFAULT_LISTING_SORT,
  parseListingSort,
} from "@/utils/listing-sort.util";
import {
  SEARCH_TERM_MIN_LENGTH,
  toSearchTerm,
} from "@/utils/search-term.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SEARCH_TITLE = "Search – DeVeSheDreams";

/** Products shown with an empty search or one with no match (two rows). */
const SEARCH_SUGGESTION_COUNT = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** The newest published products; [] when the read fails (never fatal). */
const fetchSuggestions = async (client) => {
  try {
    const page = await fetchProductPage(client, {
      sort: DEFAULT_LISTING_SORT,
      limit: SEARCH_SUGGESTION_COUNT,
    });
    return page.products;
  } catch (error) {
    console.error("Search suggestions failed:", error.message);
    return [];
  }
};

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
  const client = createServerCatalogClient();
  if (term.length < SEARCH_TERM_MIN_LENGTH) {
    return {
      props: {
        ...base,
        products: [],
        totalCount: 0,
        loadError: false,
        suggestions: await fetchSuggestions(client),
      },
    };
  }

  try {
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
        suggestions:
          page.totalCount === 0 ? await fetchSuggestions(client) : [],
      },
    };
  } catch (error) {
    console.error("Search failed:", error.message);
    return {
      props: {
        ...base,
        products: [],
        totalCount: 0,
        loadError: true,
        suggestions: [],
      },
    };
  }
}
