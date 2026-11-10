/**
 * /lookbook: the store's published lookbooks from the backend (PRD-027
 * FR-6.1, through the kit's `getLookbooks`), in the chapter list design;
 * "Coming soon" while there are none. Rendered per request.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import LookbookView from "@/views/LookbookView";
import { getLookbooks } from "@zcom/storefront-kit/server";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Lookbook – DeVeSheDreams",
  description:
    "Explore the latest DeVeSheDreams fashion collections in our Lookbook. Get inspired by curated outfits, seasonal trends, and styling ideas.",
  keywords: [
    "DeVeSheDreams lookbook",
    "fashion collections",
    "style inspiration",
    "outfit ideas",
    "seasonal trends",
    "fashion editorial"
  ],
  primaryKeywords: ["DeVeSheDreams lookbook", "fashion collections"],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "Lookbook – DeVeSheDreams",
    description:
      "Discover curated outfits and seasonal fashion trends in the DeVeSheDreams Lookbook for style inspiration."
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook – DeVeSheDreams",
    description:
      "Browse DeVeSheDreams Lookbook to explore fashion collections, outfit ideas, and seasonal styling inspiration."
  }
};

export const metadata = toMetadata(META, "/lookbook");

// ─── Page ─────────────────────────────────────────────────────────────────

// Rendered per request, like the other data pages (no build-time API call)
export const dynamic = "force-dynamic";

const LOOKBOOK_LIST_LIMIT = 50;

/** The chapter list's shape for one lookbook. */
const toChapter = (lookbook) => ({
  _id: lookbook._id,
  slug: lookbook.slug,
  name: lookbook.title || "",
  subName: lookbook.subtitle || "",
  assets: lookbook.cover?.url
    ? [{ path: lookbook.cover.url, altText: lookbook.cover.alt || "" }]
    : [],
});

export default async function Page() {
  const { lookbooks } = await getLookbooks({ limit: LOOKBOOK_LIST_LIMIT });
  return (
    <>
      <PageSchemas meta={META} path="/lookbook" />
      <LookbookView data={lookbooks.map(toChapter)} />
    </>
  );
}
