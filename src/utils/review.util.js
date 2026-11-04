/**
 * Customer reviews: pure helpers (PRD-032)
 *
 * No JSX and no browser globals at import time, so `node:test` loads it:
 * - display: dates, star clamping, the average, distribution percentages,
 *   status and reason labels;
 * - the product JSON-LD parts (`aggregateRating` only with approved
 *   reviews, at most 10 `review` entries; Google's review-snippet rules);
 * - the home section's pinned-first fallback (FR-D6);
 * - photo checks before an upload (JPEG / PNG / WebP, 5 MB, 5 photos) and
 *   the presigned POST body (every policy field first, the file last);
 * - errors by `extensions.reason` / `field`, never by message text.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/reviews.js`.
 */

// ─── Constants ────────────────────────────────────────────────────────────

export const MAX_RATING = 5;
export const REVIEW_TITLE_MAX_LENGTH = 120;
export const REVIEW_COMMENT_MAX_LENGTH = 5000;
export const REVIEW_DISPLAY_NAME_MAX_LENGTH = 40;
export const REVIEW_MAX_PHOTOS = 5;
export const REVIEW_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const REVIEW_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const REVIEW_PAGE_SIZE = 10;
export const JSON_LD_REVIEW_LIMIT = 10;

export const ReviewSortEnum = {
  NEWEST: "NEWEST",
  RATING_HIGH: "RATING_HIGH",
  RATING_LOW: "RATING_LOW",
};

export const REVIEW_SORT_LABELS = {
  [ReviewSortEnum.NEWEST]: "Newest",
  [ReviewSortEnum.RATING_HIGH]: "Highest rated",
  [ReviewSortEnum.RATING_LOW]: "Lowest rated",
};

export const ReportReasonEnum = {
  SPAM: "SPAM",
  OFFENSIVE: "OFFENSIVE",
  NOT_GENUINE: "NOT_GENUINE",
  OTHER: "OTHER",
};

export const REPORT_REASON_LABELS = {
  [ReportReasonEnum.SPAM]: "Spam",
  [ReportReasonEnum.OFFENSIVE]: "Offensive",
  [ReportReasonEnum.NOT_GENUINE]: "Not genuine",
  [ReportReasonEnum.OTHER]: "Something else",
};

export const REVIEW_STATUS_LABELS = {
  APPROVED: "Live",
  PENDING: "Pending",
  REJECTED: "Not published",
};

/** FR-D4: the hiding reason, in shopper words. */
export const REJECTION_REASON_LABELS = {
  SPAM: "it looked like spam",
  OFFENSIVE: "it contained offensive language",
  PERSONAL_INFO: "it contained personal details",
  NOT_ABOUT_PRODUCT: "it wasn't about the product",
  NOT_GENUINE: "it didn't look genuine",
  DUPLICATE: "it repeated another review",
  OTHER: "it didn't meet our review guidelines",
};

export const SUBMITTED_LIVE_MESSAGE = "Your review is live";
export const SUBMITTED_PENDING_MESSAGE =
  "Thanks! Your review will appear once the store approves it";
export const REPORTED_MESSAGE = "Thanks, we'll take a look";

/** FR-R3: a review link that is forged, of another store or expired. */
export const REASON_INVALID_LINK = "INVALID_REVIEW_LINK";

const REASON_MESSAGES = {
  REVIEW_NOT_ALLOWED: "Only customers who received this product can review it",
  REVIEWS_DISABLED: "Reviews are switched off for this store",
  RATE_LIMITED: "You've sent a lot of reviews. Please try again later.",
  INVALID_REVIEW_LINK:
    "This link has expired. Log in to review your purchases.",
  INVALID_PHOTO: "That photo couldn't be added. Use a JPEG, PNG or WebP image.",
  FILE_TOO_LARGE: "Photos can be at most 5 MB.",
  TOO_MANY_PHOTOS: `Add at most ${REVIEW_MAX_PHOTOS} photos.`,
  TOO_MANY_IDS: "Too many reviews at once. Please try again.",
};

// ─── Display ──────────────────────────────────────────────────────────────

export const clampRating = (value) =>
  Math.min(Math.max(Math.round(Number(value) || 0), 0), MAX_RATING);

export const formatReviewDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/** "4.5" (one decimal), or "" without reviews. */
export const formatAverage = (summary) =>
  summary?.reviewCount > 0 ? Number(summary.averageRating || 0).toFixed(1) : "";

/** 5★ first: `{ stars, count, percent }` rows for the bars. */
export const distributionRows = (summary) => {
  const counts = Array.isArray(summary?.distribution) ? summary.distribution : [];
  const total = Number(summary?.reviewCount) || 0;
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = Number(counts[stars - 1]) || 0;
    return {
      stars,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
};

export const reviewCountLabel = (count) =>
  `${count} review${Number(count) === 1 ? "" : "s"}`;

/** The status chip and, for a hidden review, why (FR-D4). */
export const reviewStatusText = (review) => {
  const status = String(review?.status || "").toUpperCase();
  const label = REVIEW_STATUS_LABELS[status] || "Pending";
  if (status !== "REJECTED") return { label, detail: "" };
  const reason = REJECTION_REASON_LABELS[review?.rejectionReason];
  return {
    label,
    detail: reason ? `Not published because ${reason}.` : "",
  };
};

// ─── JSON-LD (FR-D1) ──────────────────────────────────────────────────────

/**
 * `aggregateRating` and `review` for the Product JSON-LD, or `{}` when the
 * product has no approved review (Google: only ratings shown on the page).
 */
export const toReviewJsonLd = (summary, reviews = []) => {
  if (!summary || !(Number(summary.reviewCount) > 0)) return {};
  const entries = (reviews || [])
    .filter((review) => clampRating(review?.rating) > 0)
    .slice(0, JSON_LD_REVIEW_LIMIT)
    .map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.displayName || "Customer" },
      reviewRating: {
        "@type": "Rating",
        ratingValue: clampRating(review.rating),
        bestRating: MAX_RATING,
      },
      ...(review.createdAt
        ? { datePublished: String(review.createdAt).slice(0, 10) }
        : {}),
      ...(review.title ? { name: review.title } : {}),
      ...(review.comment ? { reviewBody: review.comment } : {}),
    }));
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(Number(summary.averageRating).toFixed(1)),
      reviewCount: Number(summary.reviewCount),
      bestRating: MAX_RATING,
      worstRating: 1,
    },
    ...(entries.length ? { review: entries } : {}),
  };
};

// ─── Home (FR-D6) ─────────────────────────────────────────────────────────

/** Pinned reviews when there are any, else the latest approved ones. */
export const pickHomeReviews = (featured = [], latest = [], limit = 4) => {
  const usable = (list) =>
    (list || []).filter(
      (review) => review?.comment?.trim() && clampRating(review?.rating) > 0,
    );
  const pinned = usable(featured);
  return (pinned.length ? pinned : usable(latest)).slice(0, limit);
};

// ─── Photos (FR-P1) ───────────────────────────────────────────────────────

/** An error message for a file the server would refuse, or "". */
export const reviewPhotoProblem = (file, alreadyAttached = 0) => {
  if (alreadyAttached >= REVIEW_MAX_PHOTOS) return REASON_MESSAGES.TOO_MANY_PHOTOS;
  if (!file || !REVIEW_PHOTO_TYPES.includes(file.type)) {
    return REASON_MESSAGES.INVALID_PHOTO;
  }
  if (!(file.size > 0) || file.size > REVIEW_PHOTO_MAX_BYTES) {
    return REASON_MESSAGES.FILE_TOO_LARGE;
  }
  return "";
};

/**
 * The presigned POST body: S3 reads the policy fields first, so every
 * `fields` entry goes in before the file (the file must be last).
 */
export const buildPresignedPostBody = (fields, file, FormDataClass = FormData) => {
  const body = new FormDataClass();
  for (const field of fields || []) body.append(field.name, field.value);
  body.append("file", file);
  return body;
};

// ─── Form ─────────────────────────────────────────────────────────────────

/** An empty form, or one prefilled from the shopper's own review. */
export const toReviewFormValue = (review = null, displayName = "") => ({
  rating: clampRating(review?.rating),
  title: review?.title || "",
  comment: review?.comment || "",
  displayName: review?.displayName || displayName || "",
  // Stored photos keep their `key`; new uploads carry a `receipt`
  photos: (review?.photos || []).map((photo) => ({ key: photo.key, url: photo.url })),
});

/**
 * `SubmitReviewInput` from the form: new photos as receipts, stored ones
 * the shopper kept as keys (a stored photo left out is dropped).
 */
export const toSubmitReviewInput = (productId, value) => {
  const text = (input) => {
    const trimmed = String(input || "").trim();
    return trimmed || null;
  };
  const photos = value?.photos || [];
  return {
    productId,
    rating: clampRating(value?.rating),
    title: text(value?.title),
    comment: text(value?.comment),
    displayName: text(value?.displayName),
    photoReceipts: photos.filter((photo) => photo.receipt).map((photo) => photo.receipt),
    keepPhotoKeys: photos
      .filter((photo) => photo.key && !photo.receipt)
      .map((photo) => photo.key),
  };
};

/** A field-level problem before sending, or null. */
export const reviewFormProblem = (value) => {
  if (!(clampRating(value?.rating) > 0)) {
    return { field: "rating", message: "Choose a rating from 1 to 5 stars" };
  }
  if (String(value?.title || "").length > REVIEW_TITLE_MAX_LENGTH) {
    return { field: "title", message: `Keep the title under ${REVIEW_TITLE_MAX_LENGTH} characters` };
  }
  if (String(value?.comment || "").length > REVIEW_COMMENT_MAX_LENGTH) {
    return { field: "comment", message: `Keep your review under ${REVIEW_COMMENT_MAX_LENGTH} characters` };
  }
  if (String(value?.displayName || "").length > REVIEW_DISPLAY_NAME_MAX_LENGTH) {
    return { field: "displayName", message: `Keep your name under ${REVIEW_DISPLAY_NAME_MAX_LENGTH} characters` };
  }
  return null;
};

/** The message after a write, by the status the server answered. */
export const submittedMessage = (status) =>
  String(status || "").toUpperCase() === "APPROVED"
    ? SUBMITTED_LIVE_MESSAGE
    : SUBMITTED_PENDING_MESSAGE;

// ─── Errors ───────────────────────────────────────────────────────────────

const firstError = (error) => error?.errors?.[0] || error?.graphQLErrors?.[0] || null;

/** `{ message, field }` for a refused review write. */
export const reviewErrorFeedback = (
  error,
  fallback = "Your review couldn't be sent. Please try again.",
) => {
  const extensions = firstError(error)?.extensions || {};
  const reason = extensions.reason || extensions.code || "";
  if (reason === "INVALID_REVIEW_FIELD") {
    return {
      message: firstError(error)?.message || fallback,
      field: extensions.field || null,
    };
  }
  return { message: REASON_MESSAGES[reason] || fallback, field: null };
};

export const reviewErrorReason = (error) => {
  const extensions = firstError(error)?.extensions || {};
  return extensions.reason || extensions.code || null;
};
