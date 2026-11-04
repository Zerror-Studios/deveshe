/**
 * Account: reviews (PRD-032 FR-D4)
 *
 * "Review your purchases" (`myReviewableProducts`: delivered products not
 * reviewed yet, each with the review form) and "My reviews" (`myReviews`:
 * every status, Live / Pending / Not published with the reason in plain
 * words, Edit and Delete). Loading, empty and error states for both.
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  DELETE_MY_REVIEW,
  GET_MY_REVIEWABLE_PRODUCTS,
  GET_MY_REVIEWS,
  GET_STOREFRONT_REVIEW_SETTINGS,
} from "@/graphql";
import ReviewForm from "@/components/product/review/ReviewForm";
import ReviewStars from "@/components/product/review/ReviewStars";
import {
  formatReviewDate,
  reviewErrorFeedback,
  reviewStatusText,
} from "@/utils/review.util";

// The server caps each page at 100.
const PAGE_LIMIT = 50;

const ReviewBlocks = () => {
  const [openProductId, setOpenProductId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const { data: settingsData } = useQuery(GET_STOREFRONT_REVIEW_SETTINGS);
  const photosEnabled = Boolean(settingsData?.storefrontReviewSettings?.photosEnabled);
  const reviewsEnabled = settingsData?.storefrontReviewSettings?.enabled !== false;
  const reviewable = useQuery(GET_MY_REVIEWABLE_PRODUCTS, {
    variables: { limit: PAGE_LIMIT, offset: 0 },
    fetchPolicy: "network-only",
  });
  const mine = useQuery(GET_MY_REVIEWS, {
    variables: { limit: PAGE_LIMIT, offset: 0 },
    fetchPolicy: "network-only",
  });
  const [deleteMyReview, { loading: deleting }] = useMutation(DELETE_MY_REVIEW);

  const refresh = async () => {
    await Promise.all([reviewable.refetch(), mine.refetch()]);
  };

  const handleSaved = async (_review, message) => {
    setOpenProductId(null);
    setEditingId(null);
    setNotice(message);
    await refresh();
  };

  const handleDelete = async (productId) => {
    try {
      await deleteMyReview({ variables: { productId } });
      setNotice("Your review was deleted");
      await refresh();
    } catch (error) {
      setNotice(reviewErrorFeedback(error, "Your review couldn't be deleted.").message);
    }
  };

  const toReview = reviewable.data?.myReviewableProducts?.items || [];
  const reviews = mine.data?.myReviews?.data || [];

  return (
    <div className="detail_block review_account">
      {notice && <p className="product_review_meta" role="status">{notice}</p>}

      {reviewsEnabled && (
        <section aria-labelledby="review_purchases_title">
          <h4 id="review_purchases_title">Review your purchases</h4>
          {reviewable.loading && !reviewable.data && <p role="status">Loading…</p>}
          {reviewable.error && !reviewable.data && (
            <p role="alert">
              We couldn&apos;t load your purchases.{" "}
              <button type="button" className="review_link_btn" onClick={() => reviewable.refetch()}>
                Try again
              </button>
            </p>
          )}
          {reviewable.data && toReview.length === 0 && (
            <p className="no-data">Nothing to review yet.</p>
          )}
          <ul className="review_account_list">
            {toReview.map((item) => (
              <li key={item.productId} className="product_review">
                <div className="review_link_item_head">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name || ""} width={64} height={64} unoptimized />
                  )}
                  <div>
                    <p className="product_review_title">{item.name}</p>
                    {item.deliveredAt && (
                      <p className="product_review_meta">{`Delivered ${formatReviewDate(item.deliveredAt)}`}</p>
                    )}
                  </div>
                </div>
                {openProductId === item.productId ? (
                  <ReviewForm
                    productId={item.productId}
                    photosEnabled={photosEnabled}
                    onSaved={handleSaved}
                    onCancel={() => setOpenProductId(null)}
                  />
                ) : (
                  <button type="button" className="review_link_btn" onClick={() => setOpenProductId(item.productId)}>
                    Write a review
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="my_reviews_title">
        <h4 id="my_reviews_title">My reviews</h4>
        {mine.loading && !mine.data && <p role="status">Loading…</p>}
        {mine.error && !mine.data && (
          <p role="alert">
            We couldn&apos;t load your reviews.{" "}
            <button type="button" className="review_link_btn" onClick={() => mine.refetch()}>
              Try again
            </button>
          </p>
        )}
        {mine.data && reviews.length === 0 && <p className="no-data">You haven&apos;t written a review yet.</p>}
        <ul className="review_account_list">
          {reviews.map((review) => {
            const status = reviewStatusText(review);
            return (
              <li key={review._id} className="product_review">
                <div className="product_review_head">
                  {review.product?.slug ? (
                    <Link href={`/product/${review.product.slug}`} className="product_review_title">
                      {review.product?.name || "Product"}
                    </Link>
                  ) : (
                    <p className="product_review_title">{review.product?.name || "Product"}</p>
                  )}
                  <span className={`review_status review_status_${String(review.status).toLowerCase()}`}>
                    {status.label}
                  </span>
                </div>
                {editingId === review._id ? (
                  <ReviewForm
                    productId={review.productId}
                    initialReview={review}
                    photosEnabled={photosEnabled}
                    onSaved={handleSaved}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <ReviewStars rating={review.rating} />
                    {review.title && <p className="product_review_title">{review.title}</p>}
                    {review.comment && <p className="product_review_comment">{review.comment}</p>}
                    {status.detail && <p className="product_review_meta">{status.detail}</p>}
                    <div className="review_form_actions">
                      <button type="button" className="review_link_btn" onClick={() => setEditingId(review._id)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="review_link_btn"
                        onClick={() => handleDelete(review.productId)}
                        disabled={deleting}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default ReviewBlocks;
