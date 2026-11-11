import { buildSecurityHeaders } from "@zcom/storefront-kit/core";

/**
 * Next.js config for the Deveshe Dreams storefront (PRD-002 SF-7/9/15).
 *
 * - `/v1/graphql` is proxied to the gateway by `src/proxy.js` (with
 *   the PRD-002 R2-C1 edge headers) so the API and the HttpOnly customer
 *   cookie are same-origin.
 * - Images only from the brand's asset hosts (no localhost, no third
 *   parties), plus optional extra hosts from IMAGE_REMOTE_HOSTS.
 * - Security headers from the kit's `buildSecurityHeaders` (CSP for the
 *   payment apps, GTM/GA, Google Ads, the Meta Pixel and the assets, plus
 *   nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS).
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

/**
 * Brand asset / CDN hosts, plus the platform media CDN every store's files
 * are served from since backend PRD-039 (2026-11-10; the UAT one too).
 * Without it the image optimiser refuses product and lookbook images.
 */
const DEFAULT_IMAGE_HOSTS = [
  "assets.deveshedreams.com",
  "cdn.deveshedreams.com",
  "media.zerrorstudios.com",
  "media-uat.zerrorstudios.com",
  // Live-site content (main): material photos and the blog fallback image
  // are hot-linked from these hosts; the profile avatar fallback is DiceBear.
  "a.storyblok.com",
  "ark8.net",
  "api.dicebear.com",
];

const IMAGE_HOSTS = [
  ...DEFAULT_IMAGE_HOSTS,
  ...(process.env.IMAGE_REMOTE_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

// ─── Security headers ─────────────────────────────────────────────────────

// The kit's policy (kit PRD-002 FR-1.17, FR-4.1) covers the payment apps
// (Razorpay, Cashfree; PayU and the banks in form-action), GA4/GTM, the Meta
// and Google ad tags (PRD-034), the platform media CDN and the S3 upload
// hosts (review photos, PRD-032); this adds the brand's own asset hosts and
// any extra review upload host (REVIEW_UPLOAD_HOSTS). `script-src` keeps
// 'unsafe-inline' (SF-9 partial: a nonce would make every page dynamic, and
// GTM custom-HTML tags need it). CSP_REPORT_ONLY=true ships the policy as
// report-only (rollout switch).
const ASSET_ORIGINS = IMAGE_HOSTS.map((host) => `https://${host}`);
const REVIEW_UPLOAD_ORIGINS = (process.env.REVIEW_UPLOAD_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean)
  .map((host) => (host.startsWith("https://") ? host : `https://${host}`));

const SECURITY_HEADERS = buildSecurityHeaders({
  imageHosts: ASSET_ORIGINS,
  uploadHosts: REVIEW_UPLOAD_ORIGINS,
  // The contact page's 3D phone: GLTFLoader fetches its embedded textures
  // from blob: URLs it creates itself.
  extraConnectHosts: ["blob:"],
  development: isDev,
  reportOnly: process.env.CSP_REPORT_ONLY === "true",
});

// PRD-028 FR-5.4: a shopper's payment link (`/pay/<token>`) is never
// indexed and never sent on as a referrer (the URL holds the token).
// Dynamic pages already get a private, no-store Cache-Control from Next.
const PAY_LINK_HEADERS = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

// ─── Config ───────────────────────────────────────────────────────────────

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
  async headers() {
    // Later entries win for the same header name (Referrer-Policy).
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/pay/:path*", headers: PAY_LINK_HEADERS },
    ];
  },
  async redirects() {
    return [
      // The live site linked the co-ord sets with the legacy slug.
      {
        source: "/shop/co-cord-sets",
        destination: "/shop/co-ord-sets",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
