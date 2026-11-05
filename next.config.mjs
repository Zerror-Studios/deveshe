/**
 * Next.js config for the Deveshe Dreams storefront (PRD-002 SF-7/9/15).
 *
 * - `/v1/graphql` is proxied to the gateway by `src/middleware.js` (with
 *   the PRD-002 R2-C1 edge headers) so the API and the HttpOnly customer
 *   cookie are same-origin.
 * - Images only from the brand's asset hosts (no localhost, no third
 *   parties), plus optional extra hosts from IMAGE_REMOTE_HOSTS.
 * - Security headers, including a CSP for GTM/GA, Google Ads, the Meta
 *   Pixel (PRD-034), Nimbbl and the assets.
 */

// ─── Environment ──────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== "production";

// Enforced for production builds only (RMAINT-6), so dev and lint run
// without a gateway; at runtime the API helpers still throw when unset.
const REQUIRED_ENV = ["API_GATEWAY_URL", "NEXT_PUBLIC_TENANT_DOMAIN"];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (!isDev && missingEnv.length) {
  throw new Error(`Missing required env: ${missingEnv.join(", ")}`);
}

// ─── Images ───────────────────────────────────────────────────────────────

/** Brand asset / CDN hosts; add the tenant's S3 bucket host via env. */
const DEFAULT_IMAGE_HOSTS = ["assets.deveshedreams.com", "cdn.deveshedreams.com"];

const IMAGE_HOSTS = [
  ...DEFAULT_IMAGE_HOSTS,
  ...(process.env.IMAGE_REMOTE_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

// ─── Security headers ─────────────────────────────────────────────────────

const ASSET_SOURCES = IMAGE_HOSTS.map((host) => `https://${host}`).join(" ");
const GOOGLE_SOURCES = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
].join(" ");
// PRD-034 FR-1.2: the Google Ads conversion tag (loaded through gtag.js
// from googletagmanager.com) pings these hosts and may open a measurement
// iframe on td.doubleclick.net.
const GOOGLE_ADS_SOURCES = [
  "https://www.googleadservices.com",
  "https://googleads.g.doubleclick.net",
  "https://www.google.com",
].join(" ");
const GOOGLE_ADS_FRAME_SOURCES = "https://td.doubleclick.net";
// PRD-034: the Meta Pixel script, and its pixel/beacon endpoint.
const META_SCRIPT_SOURCES = "https://connect.facebook.net";
const META_SOURCES = "https://www.facebook.com";
const NIMBBL_SOURCES = "https://*.nimbbl.tech";
// PRD-011 FR-4.2: every payment app's checkout hosts, in one place.
// Razorpay Checkout.js (script, iframe, API, event log), Cashfree JS SDK
// (script, modal, API; sandbox and live), PayU hosted page (form post).
const PAYMENT_SCRIPT_SOURCES =
  "https://checkout.razorpay.com https://sdk.cashfree.com";
const PAYMENT_FRAME_SOURCES =
  "https://api.razorpay.com https://checkout.razorpay.com https://*.cashfree.com";
const PAYMENT_CONNECT_SOURCES =
  "https://api.razorpay.com https://lumberjack.razorpay.com https://*.cashfree.com";
const PAYMENT_IMG_SOURCES = "https://*.razorpay.com https://*.cashfree.com";
// PRD-032 FR-P1: shopper review photos post straight to the media bucket
// (presigned POST) and are shown from it. Add the bucket's exact host (or
// its CDN) with REVIEW_UPLOAD_HOSTS when it isn't one of these.
const REVIEW_UPLOAD_SOURCES = [
  "https://*.s3.amazonaws.com",
  "https://*.s3.ap-south-1.amazonaws.com",
  ...(process.env.REVIEW_UPLOAD_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean)
    .map((host) => (host.startsWith("https://") ? host : `https://${host}`)),
].join(" ");
const PAYMENT_FORM_SOURCES =
  "https://test.payu.in https://secure.payu.in https://api.razorpay.com " +
  "https://*.cashfree.com";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Pages Router and GA/GTM bootstrap use inline scripts. A per-request
  // nonce (PRD-002 SF-9) was not adopted: it would make every page
  // server-rendered (no static optimisation for getStaticProps pages) and
  // GTM custom-HTML tags need 'unsafe-inline' or per-tag nonces. Roll out
  // with CSP_REPORT_ONLY=true first.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ` +
    `${GOOGLE_SOURCES} ${GOOGLE_ADS_SOURCES} ${META_SCRIPT_SOURCES} ` +
    `${NIMBBL_SOURCES} ${PAYMENT_SCRIPT_SOURCES}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${ASSET_SOURCES} ${GOOGLE_SOURCES} ${PAYMENT_IMG_SOURCES} ` +
    `${GOOGLE_ADS_SOURCES} ${META_SOURCES} ${REVIEW_UPLOAD_SOURCES}`,
  `media-src 'self' blob: ${ASSET_SOURCES}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GOOGLE_SOURCES} ${GOOGLE_ADS_SOURCES} ${META_SOURCES} ` +
    `${NIMBBL_SOURCES} ` +
    "https://checkip.amazonaws.com https://m1.openfpcdn.io " +
    `${PAYMENT_CONNECT_SOURCES} ${REVIEW_UPLOAD_SOURCES}`,
  `frame-src ${NIMBBL_SOURCES} ${PAYMENT_FRAME_SOURCES} https://www.googletagmanager.com ` +
    `${GOOGLE_ADS_FRAME_SOURCES} ${META_SOURCES}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${PAYMENT_FORM_SOURCES}`,
  "frame-ancestors 'none'",
].join("; ");

// CSP_REPORT_ONLY=true ships the policy as report-only (rollout switch).
const CSP_HEADER_NAME =
  process.env.CSP_REPORT_ONLY === "true"
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

const SECURITY_HEADERS = [
  { key: CSP_HEADER_NAME, value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]),
];

// ─── Config ───────────────────────────────────────────────────────────────

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    autoPrerender: false,
  },
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
