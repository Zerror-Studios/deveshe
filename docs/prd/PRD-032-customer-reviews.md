# PRD-032 — Customer reviews (pointer)

| Field | Value |
|---|---|
| Status | **Implemented** 2026-11-04 (this repo's FR-D1–FR-D6, FR-P5, FR-R3/R5 pages); not browser-tested or run against a live gateway |
| Source-of-truth PRD | [`../../../../zcom-backend/docs/prd/PRD-032-customer-reviews.md`](../../../../zcom-backend/docs/prd/PRD-032-customer-reviews.md) |
| Approved by / on | Anand (owner), 2026-11-04: recommended answers, except Q2 (b) shopper photos in this build |

This storefront's part is the shopper side of reviews.

## UX

- **Product page** (`components/product/ProductReviews.jsx` and `components/product/review/*`):
  - rating summary from `Product.reviewSummary` (average, count, 5★…1★ bars; each bar filters the list by its stars), read with its own query `GetProductReviewSummary`, so the reviews service can never break the catalog read;
  - approved reviews (`GetProductReviews`), first page server-rendered; sort Newest / Highest rated / Lowest rated, "With photos" (only when the summary counts photos), "Clear filters", "Load more";
  - each review: stars, "Verified buyer", title, comment (plain text), photo thumbnails with a lightbox (`role="dialog"`, `useDialogA11y`), display name · variant · date, the store's reply ("Reply from Deveshe Dreams"), and Report (Spam / Offensive / Not genuine / Something else → `reportReview`; always "Thanks, we'll take a look");
  - "Write a review" (`id="write-review"`): logged out → "Log in to write a review" (back to the page); reviews off for the store → hidden; logged in → the shopper's own review (from `myReviews`) with Edit and Delete, else the form. Whether the shopper may review is the server's call (`REVIEW_NOT_ALLOWED` → "Only customers who received this product can review it").
- **Form** (`ReviewFields.jsx`, `ReviewForm.jsx`): star picker as five radio inputs (`aria-label` "N out of 5 stars"), title (≤ 120), comment (≤ 5000, counter), display name (optional: left empty, the server shows first name + initial), photos when `storefrontReviewSettings.photosEnabled` (≤ 5, JPEG/PNG/WebP, ≤ 5 MB). Each photo uploads when picked: `requestReviewPhotoUpload` → multipart POST to `presignedPost.url` (every policy field first, the file last) → `confirmReviewPhoto` → its `receipt`; an edit keeps stored photos by key (`keepPhotoKeys`). Submit is held while a photo uploads. After saving: "Your review is live" (APPROVED) or "Thanks! Your review will appear once the store approves it". Field errors (`INVALID_REVIEW_FIELD` + `field`) show on their inputs; other reasons by `extensions.reason`.
- **`/review?token=`** (FR-R3): reads the token once, removes it from the address bar and keeps it in memory; lists the order's products (`reviewLinkOrder`), reviewed ones as done; one form per product (photos with the link token); one Submit for every rated product (`submitReviewsWithLink`). Any server refusal → "This link has expired. Log in to review your purchases." (a refresh after the token left the URL shows the same; the shopper uses the email link again). `noindex`, disallowed in robots.
- **`/review/unsubscribe?email=&token=`** (FR-R5): same pattern as `/unsubscribe`; every server answer → "You won't get review requests from us again."; only a network failure retries.
- **Account** (`/profile`, tab "My Reviews", also opened by `/profile?tab=reviews`): "Review your purchases" (`myReviewableProducts`, each with the form) and "My reviews" (`myReviews`: Live / Pending / Not published, with the reason in plain words; Edit, Delete). A delivered order's items link "Review" to that tab.
- **Home** (FR-D6): pinned reviews first (`getReviews(filter: { featured: true })`), else the latest approved ones with a comment; each card shows the display name.
- **JSON-LD** (`components/seo/ProductSchema.jsx`): `aggregateRating` plus up to 10 `review` entries from the server-rendered first page, only when `reviewCount > 0` (`toReviewJsonLd` in `utils/review.util.js`).

## Decisions in this repo

- **Q10 (stars on listing cards): not added.** `Product.reviewSummary` is resolved by commerce; adding it to `GetClientSideProducts` would make every listing (home, `/products`, categories, search) fail whenever commerce is slow or down, and that query is also edge-cached. The card overlay holds only name and price. Revisit with a catalog-side rating copy or `errorPolicy: "all"` on listings.
- Review photos render with `next/image` `unoptimized` (the bucket or CDN host varies per store, so it isn't in `remotePatterns`).

## Owner steps

1. **S3 CORS:** the media bucket that holds shopper photos needs a CORS rule allowing `POST` from this storefront's origin (and `GET` for the photos), or the upload fails in the browser.
2. **CSP:** the policy allows `https://*.s3.amazonaws.com` and `https://*.s3.ap-south-1.amazonaws.com` in `connect-src` and `img-src`; set `REVIEW_UPLOAD_HOSTS` when the bucket is in another region or photos are served from a CDN.
3. The backend's review-request job stays off (`REVIEW_REQUESTS_ENABLED`) until this storefront serves `/review` in production.

## Implementation log

| Date | Entry |
|---|---|
| 2026-11-04 | Built as above. New operations: `GetProductReviewSummary`, `GetStorefrontReviewSettings`, `GetMyReviews`, `GetMyReviewableProducts`, `GetReviewLinkOrder`, `SubmitReview`, `SubmitReviewsWithLink`, `DeleteMyReview`, `ReportReview`, `UnsubscribeReviewRequests`, `RequestReviewPhotoUpload`, `ConfirmReviewPhoto`; changed `GetReviews` (displayName) and `GetProductReviews` (fragment `ShopperReviewFields`, `sort`). Checks: `npm test` 106 pass (+12 `test/reviews.test.mjs`), `npm run validate:ops` 57/57 operations, 71 call sites, 0 failures; `next build` passes with placeholder `API_GATEWAY_URL` / `NEXT_PUBLIC_TENANT_DOMAIN`. Not run in a browser or against a live gateway; the rare-element twins are a separate change. |
