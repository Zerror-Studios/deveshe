/**
 * /robots.txt (PRD-014 FR-2.8, UX-33; was `pages/robots.txt.js`, now a
 * route handler, kit PRD-002 FR-3.1)
 *
 * Points crawlers at this site's own sitemap (`Const.ClientLink`, the same
 * origin as the canonical URLs) and keeps private or thin pages
 * (account, checkout, search, back-in-stock links, API) out of the crawl.
 */

import { Const } from "@/utils/Constant";

// ─── Constants ────────────────────────────────────────────────────────────

const ROBOTS_CACHE_SECONDS = 86400;
// `/back-in-stock/` holds single-use email links (CP-22): a crawler that
// runs scripts must not confirm someone's alert. `/pay/` links are a
// shopper's payment link (PRD-028 FR-5.4). `/review` pages hold an
// order's review link or an opt-out link (PRD-032 FR-R3, FR-R5).
const DISALLOWED_PATHS = [
  "/profile",
  "/checkout",
  "/search",
  "/back-in-stock/",
  "/pay/",
  "/review",
  "/api/",
];

// ─── Route ────────────────────────────────────────────────────────────────

export async function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${Const.ClientLink}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, s-maxage=${ROBOTS_CACHE_SECONDS}`,
    },
  });
}
