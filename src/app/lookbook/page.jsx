/**
 * /lookbook (kit PRD-002 FR-3.1; was `pages/lookbook/index.jsx`).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import LookbookView from "@/views/LookbookView";
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

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/lookbook" />
      <LookbookView />
    </>
  );
}
