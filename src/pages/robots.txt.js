/**
 * /robots.txt (PRD-014 FR-2.8, UX-33)
 *
 * Points crawlers at this site's own sitemap (`Const.ClientLink`, the same
 * origin as the canonical URLs) and keeps private or thin pages
 * (account, checkout, search, back-in-stock links, API) out of the crawl.
 */

import { Const } from "@/utils/Constant";

// ─── Constants ────────────────────────────────────────────────────────────

const ROBOTS_CACHE_SECONDS = 86400;
// `/back-in-stock/` holds single-use email links (CP-22): a crawler that
// runs scripts must not confirm someone's alert.
const DISALLOWED_PATHS = [
  "/profile",
  "/checkout",
  "/search",
  "/back-in-stock/",
  "/api/",
];

// ─── Route ────────────────────────────────────────────────────────────────

export async function getServerSideProps({ res }) {
  const body = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${Const.ClientLink}/sitemap.xml`,
    "",
  ].join("\n");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", `public, s-maxage=${ROBOTS_CACHE_SECONDS}`);
  res.write(body);
  res.end();
  return { props: {} };
}

const Robots = () => null;

export default Robots;
