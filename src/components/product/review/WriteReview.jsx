/**
 * "Write a review" on the product page (PRD-032 FR-D1, FR-D2)
 *
 * - Logged out: a link to login that comes back here.
 * - Reviews switched off for the store: nothing.
 * - Logged in: the shopper's own review of this product (from
 *   `myReviews`) with Edit and Delete, or the form. Whether they may
 *   review is the server's call: a refusal shows "Only customers who
 *   received this product can review it".
 */

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  DELETE_MY_REVIEW,
  GET_MY_REVIEWS,
  GET_STOREFRONT_REVIEW_SETTINGS,
} from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { getLoginPath } from "@/utils/redirect.util";
import ReviewForm from "./ReviewForm";
import ReviewStars from "./ReviewStars";
import { reviewErrorFeedback, reviewStatusText } from "@/utils/review.util";

// The account's reviews are read in one page (the server caps it at 100).
const MY_REVIEWS_LIMIT = 100;

const WriteReview = ({ productId }) => {
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore((state) => state);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const { data: settingsData } = useQuery(GET_STOREFRONT_REVIEW_SETTINGS);
  const settings = settingsData?.storefrontReviewSettings;
  const { data, loading, error, refetch } = useQuery(GET_MY_REVIEWS, {
    variables: { limit: MY_REVIEWS_LIMIT, offset: 0 },
    skip: !isLoggedIn,
    fetchPolicy: "network-only",
  });
  const [deleteMyReview, { loading: deleting }] = useMutation(DELETE_MY_REVIEW);
  const ownReview = (data?.myReviews?.data || []).find(
    (review) => String(review.productId) === String(productId),
  );

  if (settings && !settings.enabled) return null;

  if (!isLoggedIn) {
    return (
      <div id="write-review" className="review_write">
        <Link href={getLoginPath(pathname)} className="review_link_btn">
          Log in to write a review
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMyReview({ variables: { productId } });
      setNotice("Your review was deleted");
      await refetch();
    } catch (deleteError) {
      setNotice(reviewErrorFeedback(deleteError, "Your review couldn't be deleted.").message);
    }
  };

  const handleSaved = async (_review, message) => {
    setIsEditing(false);
    setNotice(message);
    await refetch();
  };

  if (loading && !data) {
    return (
      <div id="write-review" className="review_write" role="status">
        Loading…
      </div>
    );
  }
  if (error && !data) {
    return (
      <div id="write-review" className="review_write" role="alert">
        <p>We couldn&apos;t load your review.</p>
        <button type="button" className="review_link_btn" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div id="write-review" className="review_write">
      {notice && <p className="product_review_meta" role="status">{notice}</p>}
      {ownReview && !isEditing ? (
        <div className="review_own">
          <p className="product_review_title">Your review</p>
          <ReviewStars rating={ownReview.rating} />
          {ownReview.title && <p className="product_review_title">{ownReview.title}</p>}
          {ownReview.comment && <p className="product_review_comment">{ownReview.comment}</p>}
          <p className="product_review_meta">{reviewStatusText(ownReview).label}</p>
          {reviewStatusText(ownReview).detail && (
            <p className="product_review_meta">{reviewStatusText(ownReview).detail}</p>
          )}
          <div className="review_form_actions">
            <button type="button" className="review_link_btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button type="button" className="review_link_btn" onClick={handleDelete} disabled={deleting}>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="product_review_title">{ownReview ? "Edit your review" : "Write a review"}</h3>
          <ReviewForm
            key={ownReview?._id || "new"}
            productId={productId}
            initialReview={ownReview || null}
            photosEnabled={Boolean(settings?.photosEnabled)}
            onSaved={handleSaved}
            onCancel={ownReview ? () => setIsEditing(false) : undefined}
          />
        </>
      )}
    </div>
  );
};

export default WriteReview;
