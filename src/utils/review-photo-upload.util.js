/**
 * Review photo upload (PRD-032 FR-P1, FR-P2)
 *
 * Three steps per photo:
 * 1. `requestReviewPhotoUpload` (media) returns a presigned POST capped at
 *    the file's type and 5 MB;
 * 2. the browser posts the file straight to S3 (the presigned upload is the
 *    one call that doesn't go through Apollo, root CLAUDE.md §4);
 * 3. `confirmReviewPhoto` makes media check the real type, strip the
 *    metadata and return a signed `receipt` that `submitReview` attaches.
 * A shopper on a review link passes the link token instead of a session.
 * The mutations are passed in, so this module stays free of React.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/review-photo-upload.js`.
 */

import { buildPresignedPostBody, reviewPhotoProblem } from "@/utils/review.util";

export class ReviewPhotoUploadError extends Error {}

/**
 * Uploads one photo and returns `{ receipt, url, width, height }`.
 * Throws `ReviewPhotoUploadError` (a shopper-facing message) for a file
 * refused before upload or an S3 failure; GraphQL errors pass through.
 */
export async function uploadReviewPhoto({
  file,
  linkToken = null,
  alreadyAttached = 0,
  requestUpload,
  confirmUpload,
  fetchImpl = fetch,
}) {
  const problem = reviewPhotoProblem(file, alreadyAttached);
  if (problem) throw new ReviewPhotoUploadError(problem);

  const { data } = await requestUpload({
    variables: {
      input: {
        contentType: file.type,
        fileSize: file.size,
        ...(linkToken ? { linkToken } : {}),
      },
    },
  });
  const ticket = data?.requestReviewPhotoUpload;
  if (!ticket?.presignedPost?.url) {
    throw new ReviewPhotoUploadError("That photo couldn't be uploaded. Please try again.");
  }

  const response = await fetchImpl(ticket.presignedPost.url, {
    method: "POST",
    body: buildPresignedPostBody(ticket.presignedPost.fields, file),
  });
  if (!response?.ok) {
    throw new ReviewPhotoUploadError("That photo couldn't be uploaded. Please try again.");
  }

  const confirmed = await confirmUpload({
    variables: { uploadId: ticket.uploadId, ...(linkToken ? { linkToken } : {}) },
  });
  const receipt = confirmed?.data?.confirmReviewPhoto;
  if (!receipt?.receipt) {
    throw new ReviewPhotoUploadError("That photo couldn't be checked. Please try again.");
  }
  return receipt;
}
