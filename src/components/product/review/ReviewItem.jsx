/**
 * One approved review (PRD-032 FR-D1, FR-P5)
 *
 * Display name, "Verified buyer", the variant bought, date, title, comment
 * (plain text), photo thumbnails with a lightbox, the store's reply, and
 * Report. Reporting always answers the same "Thanks, we'll take a look".
 */

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useMutation } from "@apollo/client/react";
import { REPORT_REVIEW } from "@/graphql";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import ReviewStars from "./ReviewStars";
import { Const } from "@/utils/Constant";
import {
  REPORTED_MESSAGE,
  REPORT_REASON_LABELS,
  formatReviewDate,
} from "@/utils/review.util";

const ReviewItem = ({ review }) => {
  const [photoIndex, setPhotoIndex] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [reported, setReported] = useState(false);
  const [reportReview, { loading: reportLoading }] = useMutation(REPORT_REVIEW);
  const dialogRef = useRef(null);
  const photos = review.photos || [];
  const isLightboxOpen = photoIndex !== null;
  useDialogA11y(dialogRef, isLightboxOpen, () => setPhotoIndex(null));
  const date = formatReviewDate(review.createdAt);

  const sendReport = async () => {
    try {
      await reportReview({ variables: { id: review._id, reason } });
    } catch {
      // Same answer either way: reports never reveal anything
    }
    setReported(true);
    setIsReporting(false);
  };

  return (
    <li className="product_review">
      <div className="product_review_head">
        <ReviewStars rating={review.rating} />
        {review.verifiedPurchase && (
          <span className="review_badge">Verified buyer</span>
        )}
      </div>
      {review.title && <p className="product_review_title">{review.title}</p>}
      {review.comment && <p className="product_review_comment">{review.comment}</p>}
      {photos.length > 0 && (
        <ul className="review_photos" aria-label="Photos from this review">
          {photos.map((photo, index) => (
            <li key={photo.key || photo.url}>
              <button
                type="button"
                className="review_photo_thumb"
                onClick={() => setPhotoIndex(index)}
                aria-label={`Open photo ${index + 1} of ${photos.length}`}
              >
                <Image src={photo.url} alt="" width={96} height={96} unoptimized />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="product_review_meta">
        {[review.displayName || "Customer", review.variantLabel, date]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {review.storeReply?.message && (
        <div className="review_store_reply">
          <p className="review_store_reply_label">{`Reply from ${Const.Brand}`}</p>
          <p className="product_review_comment">{review.storeReply.message}</p>
        </div>
      )}

      {reported ? (
        <p className="product_review_meta" role="status">{REPORTED_MESSAGE}</p>
      ) : isReporting ? (
        <div className="review_report">
          <label htmlFor={`report-${review._id}`}>Why are you reporting this review?</label>
          <select
            id={`report-${review._id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          >
            {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button type="button" className="review_link_btn" onClick={sendReport} disabled={reportLoading}>
            Send report
          </button>
          <button type="button" className="review_link_btn" onClick={() => setIsReporting(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="review_link_btn" onClick={() => setIsReporting(true)}>
          Report
        </button>
      )}

      {isLightboxOpen && (
        <div
          ref={dialogRef}
          className="review_lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Review photo"
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) setPhotoIndex(null);
          }}
        >
          <div className="review_lightbox_inner">
            <Image
              src={photos[photoIndex].url}
              alt={`Photo ${photoIndex + 1} from ${review.displayName || "a customer"}'s review`}
              width={photos[photoIndex].width || 1200}
              height={photos[photoIndex].height || 1200}
              unoptimized
            />
            <div className="review_lightbox_controls">
              {photos.length > 1 && (
                <button
                  type="button"
                  className="review_link_btn"
                  onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
                  aria-label="Previous photo"
                >
                  Previous
                </button>
              )}
              <button type="button" className="review_link_btn" onClick={() => setPhotoIndex(null)} aria-label="Close photo">
                Close
              </button>
              {photos.length > 1 && (
                <button
                  type="button"
                  className="review_link_btn"
                  onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
                  aria-label="Next photo"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default ReviewItem;
