/**
 * Customer reviews (PRD-032): summary formatting, the product JSON-LD
 * parts, the home pinned-first fallback, the form → `SubmitReviewInput`
 * mapping, error feedback and the photo upload (policy fields before the
 * file, link token passed on, bad files refused before any call).
 *
 * Keep in sync with the other storefront's `test/reviews.test.mjs`.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  buildPresignedPostBody,
  distributionRows,
  formatAverage,
  pickHomeReviews,
  reviewErrorFeedback,
  reviewStatusText,
  submittedMessage,
  toReviewFormValue,
  toReviewJsonLd,
  toSubmitReviewInput,
} = await import("@/utils/review.util");
const { ReviewPhotoUploadError, uploadReviewPhoto } = await import(
  "@/utils/review-photo-upload.util"
);

const SUMMARY = {
  averageRating: 4.333,
  reviewCount: 3,
  distribution: [0, 0, 1, 0, 2],
  withPhotosCount: 1,
};

// ─── Summary ──────────────────────────────────────────────────────────────

describe("review summary", () => {
  it("formats the average and the 5★-first bars", () => {
    assert.equal(formatAverage(SUMMARY), "4.3");
    assert.equal(formatAverage({ reviewCount: 0 }), "");
    assert.deepEqual(
      distributionRows(SUMMARY).map((row) => [row.stars, row.count, row.percent]),
      [
        [5, 2, 67],
        [4, 0, 0],
        [3, 1, 33],
        [2, 0, 0],
        [1, 0, 0],
      ],
    );
  });

  it("labels statuses and the hiding reason", () => {
    assert.deepEqual(reviewStatusText({ status: "APPROVED" }), { label: "Live", detail: "" });
    assert.deepEqual(reviewStatusText({ status: "REJECTED", rejectionReason: "SPAM" }), {
      label: "Not published",
      detail: "Not published because it looked like spam.",
    });
    assert.equal(submittedMessage("APPROVED"), "Your review is live");
    assert.match(submittedMessage("PENDING"), /once the store approves it/);
  });
});

// ─── JSON-LD ──────────────────────────────────────────────────────────────

describe("toReviewJsonLd", () => {
  it("adds nothing without approved reviews", () => {
    assert.deepEqual(toReviewJsonLd(null, []), {});
    assert.deepEqual(toReviewJsonLd({ reviewCount: 0 }, [{ rating: 5 }]), {});
  });

  it("adds aggregateRating and at most 10 reviews", () => {
    const reviews = Array.from({ length: 12 }, (_, index) => ({
      rating: 5,
      displayName: `Asha ${index}`,
      createdAt: "2026-11-01T10:00:00.000Z",
      comment: "Lovely",
    }));
    const parts = toReviewJsonLd(SUMMARY, reviews);
    assert.deepEqual(parts.aggregateRating, {
      "@type": "AggregateRating",
      ratingValue: 4.3,
      reviewCount: 3,
      bestRating: 5,
      worstRating: 1,
    });
    assert.equal(parts.review.length, 10);
    assert.deepEqual(parts.review[0], {
      "@type": "Review",
      author: { "@type": "Person", name: "Asha 0" },
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      datePublished: "2026-11-01",
      reviewBody: "Lovely",
    });
  });
});

// ─── Home ─────────────────────────────────────────────────────────────────

describe("pickHomeReviews", () => {
  const latest = [
    { _id: "a", rating: 5, comment: "Great" },
    { _id: "b", rating: 4, comment: "  " },
    { _id: "c", rating: 3, comment: "Fine" },
  ];

  it("shows pinned reviews when the store pinned any", () => {
    const pinned = [{ _id: "p", rating: 5, comment: "Pinned" }];
    assert.deepEqual(pickHomeReviews(pinned, latest, 4).map((r) => r._id), ["p"]);
  });

  it("falls back to the latest reviews with a comment", () => {
    assert.deepEqual(pickHomeReviews([], latest, 4).map((r) => r._id), ["a", "c"]);
    assert.deepEqual(pickHomeReviews(undefined, latest, 1).map((r) => r._id), ["a"]);
  });
});

// ─── Form ─────────────────────────────────────────────────────────────────

describe("review form", () => {
  it("sends new photos as receipts and kept ones as keys", () => {
    const value = toReviewFormValue({
      rating: 4,
      title: "Soft",
      comment: "Lovely",
      displayName: "Asha K.",
      photos: [{ key: "t/reviews/photos/c-1/a.jpg", url: "https://x/a.jpg" }],
    });
    value.photos.push({ url: "https://x/b.jpg", receipt: "receipt-b" });
    value.title = "  ";
    assert.deepEqual(toSubmitReviewInput("p1", value), {
      productId: "p1",
      rating: 4,
      title: null,
      comment: "Lovely",
      displayName: "Asha K.",
      photoReceipts: ["receipt-b"],
      keepPhotoKeys: ["t/reviews/photos/c-1/a.jpg"],
    });
  });

  it("maps errors by reason and field, never by message text", () => {
    const error = (extensions, message = "server text") => ({ errors: [{ message, extensions }] });
    assert.deepEqual(reviewErrorFeedback(error({ reason: "REVIEW_NOT_ALLOWED" })), {
      message: "Only customers who received this product can review it",
      field: null,
    });
    assert.deepEqual(
      reviewErrorFeedback(error({ reason: "INVALID_REVIEW_FIELD", field: "title" }, "Too long")),
      { message: "Too long", field: "title" },
    );
    assert.equal(reviewErrorFeedback(new Error("offline")).field, null);
  });
});

// ─── Photos ───────────────────────────────────────────────────────────────

describe("review photo upload", () => {
  const file = { type: "image/jpeg", size: 1000, name: "a.jpg" };

  it("puts every policy field before the file", () => {
    class FakeFormData {
      constructor() {
        this.entries = [];
      }
      append(name, value) {
        this.entries.push([name, value]);
      }
    }
    const body = buildPresignedPostBody(
      [
        { name: "key", value: "t/reviews/incoming/c-1/x.jpg" },
        { name: "Policy", value: "p" },
      ],
      file,
      FakeFormData,
    );
    assert.deepEqual(body.entries.map(([name]) => name), ["key", "Policy", "file"]);
    assert.equal(body.entries.at(-1)[1], file);
  });

  it("refuses a file the server would refuse, before any call", async () => {
    let calls = 0;
    const requestUpload = async () => {
      calls += 1;
      return {};
    };
    await assert.rejects(
      uploadReviewPhoto({ file: { type: "image/svg+xml", size: 10 }, requestUpload, confirmUpload: requestUpload }),
      ReviewPhotoUploadError,
    );
    await assert.rejects(
      uploadReviewPhoto({ file: { type: "image/png", size: 6 * 1024 * 1024 }, requestUpload, confirmUpload: requestUpload }),
      /5 MB/,
    );
    await assert.rejects(
      uploadReviewPhoto({ file, alreadyAttached: 5, requestUpload, confirmUpload: requestUpload }),
      /at most 5/,
    );
    assert.equal(calls, 0);
  });

  it("asks for a ticket, posts to S3, then confirms with the link token", async () => {
    const seen = [];
    const requestUpload = async ({ variables }) => {
      seen.push(["request", variables]);
      return {
        data: {
          requestReviewPhotoUpload: {
            uploadId: "u1.jpg",
            presignedPost: { url: "https://bucket.s3.amazonaws.com", fields: [{ name: "key", value: "k" }] },
          },
        },
      };
    };
    const confirmUpload = async ({ variables }) => {
      seen.push(["confirm", variables]);
      return { data: { confirmReviewPhoto: { receipt: "r1", url: "https://cdn/x.jpg", width: 10, height: 10 } } };
    };
    const fetchImpl = async (url, init) => {
      seen.push(["post", url, init.method]);
      return { ok: true };
    };
    const receipt = await uploadReviewPhoto({ file, linkToken: "tok", requestUpload, confirmUpload, fetchImpl });
    assert.equal(receipt.receipt, "r1");
    assert.deepEqual(seen, [
      ["request", { input: { contentType: "image/jpeg", fileSize: 1000, linkToken: "tok" } }],
      ["post", "https://bucket.s3.amazonaws.com", "POST"],
      ["confirm", { uploadId: "u1.jpg", linkToken: "tok" }],
    ]);
  });

  it("stops when S3 refuses the file", async () => {
    const requestUpload = async () => ({
      data: { requestReviewPhotoUpload: { uploadId: "u", presignedPost: { url: "https://s3", fields: [] } } },
    });
    let confirmed = false;
    const confirmUpload = async () => {
      confirmed = true;
      return {};
    };
    await assert.rejects(
      uploadReviewPhoto({ file, requestUpload, confirmUpload, fetchImpl: async () => ({ ok: false }) }),
      ReviewPhotoUploadError,
    );
    assert.equal(confirmed, false);
  });
});
