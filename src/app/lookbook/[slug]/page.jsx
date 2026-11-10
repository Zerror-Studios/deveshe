/**
 * /lookbook/[slug]: one published lookbook from the backend (PRD-027
 * FR-6.2, through the kit's `getLookbook`). An unknown or hidden slug is a
 * 404; an old slug (`previousSlugs`) answers 301 to the current one.
 * Rendered per request; no loading boundary above it, so both are real
 * status codes.
 */

import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getLookbook } from "@zcom/storefront-kit/server";
import PageSchemas from "@/components/seo/PageSchemas";
import LookbookDetailView from "@/views/LookbookDetailView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { htmlToPlainText } from "@/utils/lookbook-text.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SITE_NAME = "DeVeSheDreams";
const META_DESCRIPTION_MAX_LENGTH = 160;

export const dynamic = "force-dynamic";

// ─── Data ─────────────────────────────────────────────────────────────────

// One read for the metadata and the page.
const readLookbook = cache(async (slug) => await getLookbook(slug));

/** The page's meta object (a merchant SEO field wins, as on the product page). */
const toLookbookMeta = (lookbook) => {
  const seo = lookbook.seo || {};
  // A merchant SEO title is complete (as on the product page)
  const title = seo.title || `${lookbook.title} – ${SITE_NAME}`;
  const description = (
    seo.description ||
    lookbook.subtitle ||
    htmlToPlainText(lookbook.intro)
  ).slice(0, META_DESCRIPTION_MAX_LENGTH);
  const image = seo.ogImageUrl || lookbook.cover?.url || "";
  return {
    title,
    description,
    author: SITE_NAME,
    robots: "index, follow",
    og: { title, description, image },
    twitter: { card: "summary_large_image", title, description, image },
  };
};

// ─── Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { lookbook, redirectTo } = await readLookbook(slug);
  if (!lookbook || redirectTo) return {};
  return toMetadata(toLookbookMeta(lookbook), `/lookbook/${lookbook.slug}`);
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function Page({ params }) {
  const { slug } = await params;
  const { lookbook, redirectTo } = await readLookbook(slug);
  if (redirectTo) permanentRedirect(`/lookbook/${redirectTo}`);
  if (!lookbook) notFound();
  return (
    <>
      <PageSchemas
        meta={toLookbookMeta(lookbook)}
        path={`/lookbook/${lookbook.slug}`}
      />
      <LookbookDetailView lookbook={lookbook} />
    </>
  );
}
