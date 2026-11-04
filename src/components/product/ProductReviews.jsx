/**
 * Product reviews (PRD-014 FR-2.8, PRD-032 FR-D1)
 *
 * The rating summary (approved reviews only; each bar filters by its
 * stars), the approved reviews with sort (newest, highest, lowest), "With
 * photos" and "Load more", and "Write a review". The first page comes from
 * the server render; changing a filter re-reads from the API. With no
 * approved review the list shows an empty state, and the form is still
 * offered.
 *
 * Keep in sync with `storefronts/rare-element/src/components/product/ProductReviews.jsx`.
 */

import React, { useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { GET_PRODUCT_REVIEWS } from "@/graphql";
import RatingSummary from "./review/RatingSummary";
import ReviewItem from "./review/ReviewItem";
import WriteReview from "./review/WriteReview";
import {
  REVIEW_PAGE_SIZE,
  REVIEW_SORT_LABELS,
  ReviewSortEnum,
  reviewCountLabel,
} from "@/utils/review.util";

// ─── Component ────────────────────────────────────────────────────────────

const ProductReviews = ({ productId, summary = null, reviews = [], totalCount = 0 }) => {
  const client = useApolloClient();
  const [sort, setSort] = useState(ReviewSortEnum.NEWEST);
  const [rating, setRating] = useState(null);
  const [withPhotos, setWithPhotos] = useState(false);
  const [list, setList] = useState(reviews);
  const [total, setTotal] = useState(totalCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isFirstRender = useRef(true);

  const fetchPage = async (offset) => {
    const { data } = await client.query({
      query: GET_PRODUCT_REVIEWS,
      variables: {
        limit: REVIEW_PAGE_SIZE,
        offset,
        sort,
        filter: {
          productId,
          ...(rating ? { rating } : {}),
          ...(withPhotos ? { hasPhotos: true } : {}),
        },
      },
      fetchPolicy: "network-only",
    });
    return data?.getReviews || { data: [], totalCount: 0 };
  };

  // A new product page starts from its server-rendered reviews again
  useEffect(() => {
    setList(reviews);
    setTotal(totalCount);
    setSort(ReviewSortEnum.NEWEST);
    setRating(null);
    setWithPhotos(false);
    isFirstRender.current = true;
  }, [productId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPage(0)
      .then((page) => {
        if (cancelled) return;
        setList(page.data || []);
        setTotal(page.totalCount || 0);
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sort, rating, withPhotos]);

  const loadMore = async () => {
    setLoading(true);
    setError(false);
    try {
      const page = await fetchPage(list.length);
      setList((current) => [...current, ...(page.data || [])]);
      setTotal(page.totalCount || 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = Boolean(rating || withPhotos);

  return (
    <section className="product_reviews" aria-labelledby="product_reviews_title">
      <h2 id="product_reviews_title" className="product_reviews_title">
        {summary?.reviewCount ? `Reviews (${summary.reviewCount})` : "Reviews"}
      </h2>

      <RatingSummary summary={summary} activeRating={rating} onSelectRating={setRating} />

      {summary?.reviewCount > 0 && (
        <div className="review_toolbar">
          <label htmlFor="review_sort">
            Sort by{" "}
            <select id="review_sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              {Object.entries(REVIEW_SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          {summary.withPhotosCount > 0 && (
            <label htmlFor="review_with_photos" className="review_toolbar_check">
              <input
                id="review_with_photos"
                type="checkbox"
                checked={withPhotos}
                onChange={(event) => setWithPhotos(event.target.checked)}
              />
              With photos
            </label>
          )}
          {hasFilters && (
            <button
              type="button"
              className="review_link_btn"
              onClick={() => {
                setRating(null);
                setWithPhotos(false);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div aria-live="polite" aria-busy={loading}>
        {list.length > 0 ? (
          <ul className="product_reviews_list">
            {list.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </ul>
        ) : (
          !loading && (
            <p className="product_review_meta">
              {hasFilters
                ? "No reviews match these filters."
                : "No reviews yet. Be the first to review this product."}
            </p>
          )
        )}
        {error && (
          <p className="review_field_error" role="alert">
            We couldn&apos;t load reviews. Please try again.
          </p>
        )}
        {list.length < total && (
          <div className="review_form_actions">
            <button type="button" className="review_link_btn" onClick={loadMore} disabled={loading}>
              {loading ? "Loading…" : `Load more (${reviewCountLabel(total - list.length)} left)`}
            </button>
          </div>
        )}
      </div>

      <WriteReview productId={productId} />
    </section>
  );
};

export default ProductReviews;
