"use client";

/**
 * Product listing (PRD-014 FR-0.8, UX-01 / D9)
 *
 * Used by `/search` (the shop itself is `/shop`, live site design, which
 * filters on the client). Cards are the shop's curated grid cards.
 * The first page is rendered on the server; "Load more" asks
 * `getClientSideProducts` for the next page with the same filters, so every
 * published product is reachable by navigation. A failed load shows an
 * error with a retry instead of an endless skeleton. The sort control
 * (W2-STORE) keeps its value in `?sort=` (NEWEST is the default and left
 * out); changing it reloads the page server-side from the first page.
 * Without a `title` the header holds only the sort control (the search
 * page shows its own centred heading) and `listName` labels the section.
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";

import ProductGridCard from "@/components/common/card/ProductGridCard";
import { GET_PRODUCTS } from "@/graphql";
import { getErrorMessage } from "@/utils/api-error.util";
import { toProductPageVariables } from "@/utils/catalog-listing.util";
import {
  DEFAULT_LISTING_SORT,
  LISTING_SORT_OPTIONS,
  toSortQueryValue,
} from "@/utils/listing-sort.util";
import { LISTING_PAGE_SIZE } from "./listing.constants";

// ─── Constants ────────────────────────────────────────────────────────────

export { LISTING_PAGE_SIZE };

// The shop's curated grid (styles/components/home/curated-products.css).
// The first row (two cards on a phone, four on desktop) is the LCP
const LISTING_PRELOAD_COUNT = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────

const appendUnique = (current, next) => {
  const seen = new Set(current.map((product) => product?._id));
  return [
    ...current,
    ...(next || []).filter((product) => !seen.has(product?._id)),
  ];
};

// ─── Component ────────────────────────────────────────────────────────────

const ProductListing = ({
  title,
  description,
  products: initialProducts = [],
  totalCount: initialTotalCount = 0,
  filters = {},
  sort = DEFAULT_LISTING_SORT,
  categories = [],
  activeSlug = "",
  listName,
  loadError = false,
  emptyMessage = "There are no products here yet.",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const client = useApolloClient();
  const [products, setProducts] = useState(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  const hasMore = products.length < totalCount;

  /* ----- Handlers ----- */

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError("");
    try {
      const { data } = await client.query({
        query: GET_PRODUCTS,
        variables: toProductPageVariables({
          filters,
          limit: LISTING_PAGE_SIZE,
          offset: products.length,
          sort,
        }),
        fetchPolicy: "network-only",
      });
      const page = data?.getClientSideProducts;
      setProducts((current) => appendUnique(current, page?.products));
      if (typeof page?.totalCount === "number") {
        setTotalCount(page.totalCount);
      }
    } catch (error) {
      setLoadMoreError(
        getErrorMessage(error, "We could not load more products."),
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Renders the route again on the server (the first page's data).
  const handleRetry = () => router.refresh();

  // A new sort starts the list again from the first page on the server;
  // the pages remount this listing per sort (their `key`).
  const handleSortChange = (event) => {
    const query = new URLSearchParams(searchParams.toString());
    const next = toSortQueryValue(event.target.value);
    if (next) query.set("sort", next);
    else query.delete("sort");
    const search = query.toString();
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  /* ----- Render ----- */

  return (
    <section
      className="listing_wrapper"
      aria-labelledby={title ? "listing_title" : undefined}
      aria-label={title ? undefined : listName}
    >
      <header className="listing_header">
        {title && (
          <h1 id="listing_title" className="listing_title">
            {title}
          </h1>
        )}
        {description && <p className="listing_description">{description}</p>}
        {categories.length > 0 && (
          <nav className="listing_categories" aria-label="Shop by category">
            <Link
              href="/shop"
              className={`listing_category ${!activeSlug ? "active" : ""}`}
              aria-current={!activeSlug ? "page" : undefined}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/shop/${encodeURIComponent(category.slug)}`}
                className={`listing_category ${
                  activeSlug === category.slug ? "active" : ""
                }`}
                aria-current={activeSlug === category.slug ? "page" : undefined}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
        <div className="listing_sort">
          <label htmlFor="listing_sort_select">Sort by</label>
          <select
            id="listing_sort_select"
            value={sort}
            onChange={handleSortChange}
          >
            {LISTING_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loadError ? (
        <div className="listing_state" role="alert">
          <p>We could not load the collection right now.</p>
          <button
            type="button"
            className="listing_button"
            onClick={handleRetry}
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="listing_state">
          <p>{emptyMessage}</p>
          {(activeSlug || filters.search) && (
            <Link href="/shop" className="listing_button">
              View all products
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="curated-grid">
            {products.map((product, index) => (
              <ProductGridCard
                key={product._id}
                preload={index < LISTING_PRELOAD_COUNT}
                product={product}
                listName={listName}
              />
            ))}
          </div>

          <div className="listing_footer">
            <p className="listing_count" aria-live="polite">
              Showing {products.length} of {totalCount}
            </p>
            {loadMoreError && (
              <p className="error" role="alert">
                {loadMoreError}
              </p>
            )}
            {hasMore && (
              <button
                type="button"
                className="listing_button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ProductListing;
