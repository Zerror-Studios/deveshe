"use client";

/**
 * Site search (PRD-014 FR-2.8, UX-28)
 *
 * `/search?q=…` searches published products by name, description and SKU
 * through `getClientSideProducts(filters.search)`, first page on the
 * server, "Load more" after (the shared listing). Laid out as the shop's
 * product section: the centred heading, the search box under it, then the
 * results in the shop grid. Without a query, or when nothing matches, the
 * newest products are shown as suggestions. Results depend on the query
 * string, so the page is `noindex, follow` and its canonical has no query;
 * `/search` is also disallowed in robots.txt. Data:
 * `lib/page-data/listing.server.js` (`loadSearchPage`).
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

import ProductGridCard from "@/components/common/card/ProductGridCard";
import ProductListing from "@/components/listing/ProductListing";
import { trackSearch } from "@/utils/analytics-events.util";
import {
  SEARCH_TERM_MAX_LENGTH,
  SEARCH_TERM_MIN_LENGTH,
  toSearchTerm,
} from "@/utils/search-term.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SEARCH_INTRO = "Find pieces by name, print or collection.";

// The first row of suggestions is above the fold without a query
const SUGGESTION_PRELOAD_COUNT = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────

const toResultSummary = (term, totalCount, loadError) => {
  if (loadError) return `Searching for “${term}”`;
  if (totalCount === 0) return `No products match “${term}”.`;
  const noun = totalCount === 1 ? "piece" : "pieces";
  return `${totalCount} ${noun} for “${term}”`;
};

// ─── Page ─────────────────────────────────────────────────────────────────

const SearchPage = ({
  term,
  products,
  totalCount,
  filters,
  sort,
  loadError,
  suggestions = [],
}) => {
  const router = useRouter();
  const inputRef = useRef(null);
  const [input, setInput] = useState(term);
  const [formError, setFormError] = useState("");
  const canSearch = term.length >= SEARCH_TERM_MIN_LENGTH;
  const hasResults = canSearch && (loadError || totalCount > 0);

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
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  return (
    <section className="curated-container is-shop search_page">
      <div className="curated-header search_header">
        <h1 className="curated-heading">
          <span className="heading-accent">Search</span>
        </h1>
        <p className="curated-description" aria-live="polite">
          {canSearch
            ? toResultSummary(term, totalCount, loadError)
            : SEARCH_INTRO}
        </p>
      </div>

      <form role="search" className="search_form" onSubmit={handleSubmit}>
        <label htmlFor="site_search_input" className="sr-only">
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
          <p id="search_form_error" className="search_form_error" role="alert">
            {formError}
          </p>
        )}
      </form>

      {hasResults && (
        <ProductListing
          key={`${term}:${sort}`}
          products={products}
          totalCount={totalCount}
          filters={filters}
          sort={sort}
          listName="Search results"
          loadError={loadError}
          emptyMessage={`No products match “${term}”.`}
        />
      )}

      {!hasResults && suggestions.length > 0 && (
        <div className="search_suggestions">
          <h2 className="search_suggestions_title">
            {canSearch ? "You might like" : "New in"}
          </h2>
          <div className="curated-grid">
            {suggestions.map((product, index) => (
              <ProductGridCard
                key={product?._id || product?.slug}
                product={product}
                listName="Search suggestions"
                preload={!canSearch && index < SUGGESTION_PRELOAD_COUNT}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchPage;
