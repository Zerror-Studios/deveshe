/**
 * Review form fields (PRD-032 FR-D2, FR-P1)
 *
 * Controlled: stars, title, comment (with a counter), display name and,
 * when the store takes them, up to five photos. A photo uploads as soon as
 * it is picked (presigned POST to S3, then media's check) and is kept as a
 * receipt; a stored photo is kept by its key until the shopper removes it.
 * Used by the product page, the account page and the review-link page
 * (`linkToken` instead of a session). `onChange` takes a value or an
 * updater function, like a `useState` setter, so an upload that finishes
 * later never overwrites text typed meanwhile.
 */

import React, { useState } from "react";
import Image from "next/image";
import { useMutation } from "@apollo/client/react";
import { CONFIRM_REVIEW_PHOTO, REQUEST_REVIEW_PHOTO_UPLOAD } from "@/graphql";
import StarRatingInput from "./StarRatingInput";
import {
  REVIEW_COMMENT_MAX_LENGTH,
  REVIEW_DISPLAY_NAME_MAX_LENGTH,
  REVIEW_MAX_PHOTOS,
  REVIEW_PHOTO_TYPES,
  REVIEW_TITLE_MAX_LENGTH,
  reviewErrorFeedback,
} from "@/utils/review.util";
import {
  ReviewPhotoUploadError,
  uploadReviewPhoto,
} from "@/utils/review-photo-upload.util";

const ReviewFields = ({
  idPrefix,
  value,
  onChange,
  errors = {},
  photosEnabled = false,
  linkToken = null,
  disabled = false,
  onUploadingChange,
}) => {
  const [requestUpload] = useMutation(REQUEST_REVIEW_PHOTO_UPLOAD);
  const [confirmUpload] = useMutation(CONFIRM_REVIEW_PHOTO);
  const [uploading, setUploading] = useState(0);
  const [photoError, setPhotoError] = useState("");
  const photos = value.photos || [];

  const set = (patch) => onChange((previous) => ({ ...previous, ...patch }));

  const changeUploading = (delta) => {
    setUploading((count) => {
      const next = count + delta;
      onUploadingChange?.(next > 0);
      return next;
    });
  };

  const addPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setPhotoError("");
    let attached = photos.length + uploading;
    for (const file of files) {
      changeUploading(1);
      try {
        const receipt = await uploadReviewPhoto({
          file,
          linkToken,
          alreadyAttached: attached,
          requestUpload,
          confirmUpload,
        });
        attached += 1;
        onChange((previous) => ({
          ...previous,
          photos: [...(previous.photos || []), { url: receipt.url, receipt: receipt.receipt }],
        }));
      } catch (error) {
        setPhotoError(
          error instanceof ReviewPhotoUploadError
            ? error.message
            : reviewErrorFeedback(error, "That photo couldn't be uploaded.").message,
        );
      } finally {
        changeUploading(-1);
      }
    }
  };

  const removePhoto = (index) =>
    onChange((previous) => ({
      ...previous,
      photos: (previous.photos || []).filter((_, position) => position !== index),
    }));

  return (
    <div className="review_fields">
      <StarRatingInput
        value={value.rating}
        onChange={(rating) => set({ rating })}
        error={errors.rating}
      />

      <label className="review_field" htmlFor={`${idPrefix}-title`}>
        <span>Title (optional)</span>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={value.title}
          maxLength={REVIEW_TITLE_MAX_LENGTH}
          onChange={(event) => set({ title: event.target.value })}
          disabled={disabled}
          aria-invalid={errors.title ? "true" : undefined}
        />
        {errors.title && <span className="review_field_error">{errors.title}</span>}
      </label>

      <label className="review_field" htmlFor={`${idPrefix}-comment`}>
        <span>Your review (optional)</span>
        <textarea
          id={`${idPrefix}-comment`}
          rows={5}
          value={value.comment}
          maxLength={REVIEW_COMMENT_MAX_LENGTH}
          onChange={(event) => set({ comment: event.target.value })}
          disabled={disabled}
          aria-describedby={`${idPrefix}-comment-count`}
          aria-invalid={errors.comment ? "true" : undefined}
        />
        <span id={`${idPrefix}-comment-count`} className="review_field_hint">
          {`${value.comment.length} / ${REVIEW_COMMENT_MAX_LENGTH}`}
        </span>
        {errors.comment && <span className="review_field_error">{errors.comment}</span>}
      </label>

      <label className="review_field" htmlFor={`${idPrefix}-name`}>
        <span>Name shown with your review (optional)</span>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={value.displayName}
          maxLength={REVIEW_DISPLAY_NAME_MAX_LENGTH}
          onChange={(event) => set({ displayName: event.target.value })}
          disabled={disabled}
          aria-invalid={errors.displayName ? "true" : undefined}
          aria-describedby={`${idPrefix}-name-hint`}
        />
        <span id={`${idPrefix}-name-hint`} className="review_field_hint">
          Left empty, we show your first name and initial.
        </span>
        {errors.displayName && <span className="review_field_error">{errors.displayName}</span>}
      </label>

      {photosEnabled && (
        <div className="review_field">
          <span>{`Photos (optional, up to ${REVIEW_MAX_PHOTOS})`}</span>
          {photos.length > 0 && (
            <ul className="review_photos">
              {photos.map((photo, index) => (
                <li key={photo.key || photo.receipt || photo.url}>
                  <Image src={photo.url} alt={`Your photo ${index + 1}`} width={96} height={96} unoptimized />
                  <button
                    type="button"
                    className="review_link_btn"
                    onClick={() => removePhoto(index)}
                    disabled={disabled}
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {photos.length + uploading < REVIEW_MAX_PHOTOS && (
            <input
              id={`${idPrefix}-photos`}
              type="file"
              accept={REVIEW_PHOTO_TYPES.join(",")}
              multiple
              onChange={addPhotos}
              disabled={disabled}
              aria-label="Add photos"
            />
          )}
          {uploading > 0 && <span className="review_field_hint" role="status">Uploading…</span>}
          {(photoError || errors.photoReceipts) && (
            <span className="review_field_error" role="alert">{photoError || errors.photoReceipts}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewFields;
