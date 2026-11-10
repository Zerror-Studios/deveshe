/**
 * /lookbook/[slug] (kit PRD-002 FR-3.1; was `pages/lookbook/[slug]/index.jsx`).
 * Static editorial content (no lookbook backend); an unknown slug is a 404.
 */

import { notFound } from "next/navigation";
import PageSchemas from "@/components/seo/PageSchemas";
import LookbookDetailView from "@/views/LookbookDetailView";
import { LookbookChapters } from "@/helpers/LookbookData";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Lookbook – Explore DeVeSheDreams Collections",
  description:
    "Browse the DeVeSheDreams lookbook to explore our bold, dream-inspired collections. Discover vibrant prints, artist-led designs, and wearable creativity.",
  keywords:
    "DeVeSheDreams lookbook, fashion capsule collection, artistic fashion photos, designer collection showcase",
  author: "DeVeSheDreams",
  robots: "index, follow",
};

const findChapter = (slug) =>
  LookbookChapters.find((chapter) => chapter._id === slug);

// Rendered per request, as getServerSideProps was.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return toMetadata(META, `/lookbook/${slug}`);
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function Page({ params }) {
  const { slug } = await params;
  const data = findChapter(slug);
  if (!data) notFound();
  return (
    <>
      <PageSchemas meta={META} path={`/lookbook/${slug}`} />
      <LookbookDetailView data={data} />
    </>
  );
}
