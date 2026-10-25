/**
 * Site search (PRD-014 FR-2.8, UX-28)
 *
 * `/search?q=…` searches published products by name, description and SKU
 * through `getClientSideProducts(filters.search)`, first page on the
 * server, "Load more" after (the shared listing). Results depend on the
 * query string, so the page is `noindex, follow` and its canonical has no
 * query; `/search` is also disallowed in robots.txt.
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiSearch } from "react-icons/fi";

import SeoHeader from "@/components/seo/SeoHeader";
import ProductListing, {
  LISTING_PAGE_SIZE,
} from "@/components/listing/ProductListing";
import {
  createServerCatalogClient,
  fetchProductPage,
  toListingFilters,
} from "@/lib/catalog-listing.server";
import { trackSearch } from "@/utils/analytics-events.util";
import { Const } from "@/utils/Constant";
import { parseListingSort } from "@/utils/listing-sort.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SEARCH_TERM_MIN_LENGTH = 2;
const SEARCH_TERM_MAX_LENGTH = 100;
const SEARCH_TITLE = "Search – DeVeSheDreams";

// ─── Helpers ──────────────────────────────────────────────────────────────

const toSearchTerm = (value) =>
  String(Array.isArray(value) ? value[0] : value || "")
    .trim()
    .slice(0, SEARCH_TERM_MAX_LENGTH);

// ─── Page ─────────────────────────────────────────────────────────────────

const SearchPage = ({
  meta,
  term,
  products,
  totalCount,
  filters,
  sort,
  loadError,
}) => {
  const router = useRouter();
  const inputRef = useRef(null);
  const [input, setInput] = useState(term);
  const [formError, setFormError] = useState("");
  const canSearch = term.length >= SEARCH_TERM_MIN_LENGTH;

  useEffect(() => {
    setInput(term);
    setFormError("");
    if (canSearch && !loadError) trackSearch(term, totalCount);
    if (!canSearch) inputRef.current?.focus();
  }, [term]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = toSearchTerm(input);
    if (next.length < SEARCH_TERM_MIN_LENGTH) {
      setFormError(`Type at least ${SEARCH_TERM_MIN_LENGTH} characters.`);
      inputRef.current?.focus();
      return;
    }
    router.push({ pathname: "/search", query: { q: next } });
  };

  return (
    <>
      <SeoHeader meta={meta} />
      <div className="search_page">
        <form role="search" className="search_form" onSubmit={handleSubmit}>
          <label htmlFor="site_search_input" className="search_label">
            Search products
          </label>
          <div className="search_field">
            <input
              ref={inputRef}
              id="site_search_input"
              type="search"
              name="q"
              value={input}
              maxLength={SEARCH_TERM_MAX_LENGTH}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Dresses, prints, collections…"
              autoComplete="off"
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? "search_form_error" : undefined}
            />
            <button type="submit" aria-label="Search">
              <FiSearch aria-hidden="true" />
            </button>
          </div>
          {formError && (
            <p id="search_form_error" className="error" role="alert">
              {formError}
            </p>
          )}
        </form>
        {canSearch && (
          <ProductListing
            key={`${term}:${sort}`}
            title={`Results for “${term}”`}
            products={products}
            totalCount={totalCount}
            filters={filters}
            sort={sort}
            listName="Search results"
            loadError={loadError}
            emptyMessage={`No products match “${term}”.`}
          />
        )}
      </div>
    </>
  );
};

export default SearchPage;

export async function getServerSideProps({ query }) {
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
  if (term.length < SEARCH_TERM_MIN_LENGTH) {
    return {
      props: {
        meta,
        term,
        filters,
        sort,
        products: [],
        totalCount: 0,
        loadError: false,
      },
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
        meta,
        term,
        filters,
        sort,
        products: page.products,
        totalCount: page.totalCount,
        loadError: false,
      },
    };
  } catch (error) {
    console.error("Search failed:", error.message);
    return {
      props: {
        meta,
        term,
        filters,
        sort,
        products: [],
        totalCount: 0,
        loadError: true,
      },
    };
  }
}
