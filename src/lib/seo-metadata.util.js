/**
 * Page metadata for the App Router (kit PRD-002 FR-3.1).
 *
 * The pages keep the `meta` objects they had under the Pages Router
 * (`title`, `description`, `keywords`, `author`, `robots`, `canonical`,
 * `og`, `twitter`); `toMetadata` turns one into Next's `Metadata`, with
 * the same tags `components/seo/SeoHeader.jsx` used to write. The
 * canonical never carries a query string or hash (PRD-014 FR-2.8, UX-33):
 * pass the route's path, or a `meta.canonical`.
 */

import { Const } from "@/utils/Constant";

// ─── Constants ────────────────────────────────────────────────────────────

export const SITE_NAME = "DeVeSheDreams";
const TWITTER_HANDLE = "@DeVeSheDreams";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const DEFAULT_ROBOTS = "index, follow";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** The absolute canonical URL of `path` (query and hash dropped). */
export const toCanonical = (meta, path = "/") =>
  meta?.canonical || `${Const.ClientLink}${String(path).split(/[?#]/)[0] || "/"}`;

const toKeywords = (keywords) => {
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  return keywords ? String(keywords) : undefined;
};

const toImages = (image) =>
  image
    ? [{ url: image, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT }]
    : undefined;

// ─── Metadata ─────────────────────────────────────────────────────────────

/** Next `Metadata` for a page's `meta` object, at `path`. */
export function toMetadata(meta = {}, path = "/") {
  const canonical = toCanonical(meta, path);
  const title = meta.title || "";
  const description = meta.description || "";

  return {
    // `absolute`: the titles already end with the brand
    title: { absolute: title },
    description,
    keywords: toKeywords(meta.keywords),
    authors: [{ name: meta.author || SITE_NAME }],
    robots: `${meta.robots || DEFAULT_ROBOTS}, max-image-preview:large`,
    alternates: {
      canonical,
      languages: { "en-IN": canonical },
    },
    openGraph: {
      locale: "en_IN",
      type: "website",
      title: meta.og?.title || "",
      description: meta.og?.description || "",
      url: canonical,
      siteName: SITE_NAME,
      images: toImages(meta.og?.image),
    },
    twitter: {
      card: meta.twitter?.card || "summary_large_image",
      title: meta.twitter?.title || title,
      description: meta.twitter?.description || description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: meta.twitter?.image ? [meta.twitter.image] : undefined,
    },
  };
}
