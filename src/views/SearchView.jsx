"use client";

/**
 * Site search (PRD-014 FR-2.8, UX-28)
 *
 * `/search?q=…` searches published products by name, description and SKU
 * through `getClientSideProducts(filters.search)`, first page on the
 * server, "Load more" after (the shared listing). Results depend on the
 * query string, so the page is `noindex, follow` and its canonical has no
 * query; `/search` is also disallowed in robots.txt. Data:
 * `lib/page-data/listing.server.js` (`loadSearchPage`).
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

import ProductListing from "@/components/listing/ProductListing";
import { trackSearch } from "@/utils/analytics-events.util";
import {
  SEARCH_TERM_MAX_LENGTH,
  SEARCH_TERM_MIN_LENGTH,
  toSearchTerm,
} from "@/utils/search-term.util";

// ─── Page ─────────────────────────────────────────────────────────────────

const SearchPage = ({
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
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  return (
    <>
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
