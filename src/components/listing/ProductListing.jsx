/**
 * Product listing (PRD-014 FR-0.8, UX-01 / D9)
 *
 * Shared by `/products` (every published product) and `/category/[slug]`.
 * The first page is rendered on the server; "Load more" asks
 * `getClientSideProducts` for the next page with the same filters, so every
 * published product is reachable by navigation. A failed load shows an
 * error with a retry instead of an endless skeleton.
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client/react";

import ProductCard from "@/components/common/card/ProductCard";
import { GET_PRODUCTS } from "@/graphql";
import { getProductPriceLabel } from "@/utils/Util";
import { getErrorMessage } from "@/utils/api-error.util";

// ─── Constants ────────────────────────────────────────────────────────────

export const LISTING_PAGE_SIZE = 12;

// 2 / 3 / 4 columns (styles/components/product-listing.css), RPERF-12.
const LISTING_GRID_SIZES =
  "(max-width: 576px) 50vw, (max-width: 1000px) 33vw, 25vw";

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
  categories = [],
  activeSlug = "",
  listName,
  loadError = false,
}) => {
  const router = useRouter();
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
        variables: {
          offset: products.length,
          limit: LISTING_PAGE_SIZE,
          filters,
        },
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

  const handleRetry = () => router.replace(router.asPath);

  /* ----- Render ----- */

  return (
    <section className="listing_wrapper" aria-labelledby="listing_title">
      <header className="listing_header">
        <h1 id="listing_title" className="listing_title">
          {title}
        </h1>
        {description && <p className="listing_description">{description}</p>}
        {categories.length > 0 && (
          <nav className="listing_categories" aria-label="Shop by category">
            <Link
              href="/products"
              className={`listing_category ${!activeSlug ? "active" : ""}`}
              aria-current={!activeSlug ? "page" : undefined}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${encodeURIComponent(category.slug)}`}
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
          <p>There are no products here yet.</p>
          {activeSlug && (
            <Link href="/products" className="listing_button">
              View all products
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="listing_grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                href={`/product/${product.slug || ""}`}
                src={product.assets?.[0]?.path || ""}
                alt={product.assets?.[0]?.altText || product.name || ""}
                name={product.name || ""}
                price={getProductPriceLabel(product.variants)}
                sizes={LISTING_GRID_SIZES}
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
