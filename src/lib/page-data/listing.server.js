/**
 * Search page data — SERVER ONLY (kit PRD-002 FR-3.1; was the
 * `getServerSideProps` of `pages/search`).
 *
 * `/search?q=…` (PRD-014 FR-2.8, UX-28) searches published products by
 * name, description and SKU; `noindex, follow`, canonical without query.
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
import { parseListingSort } from "@/utils/listing-sort.util";
import {
  SEARCH_TERM_MIN_LENGTH,
  toSearchTerm,
} from "@/utils/search-term.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SEARCH_TITLE = "Search – DeVeSheDreams";

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
