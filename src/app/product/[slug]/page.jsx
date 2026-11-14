/**
 * /product/[slug] (kit PRD-002 FR-3.1; was `pages/product/[slug]/index.jsx`
 * with getServerSideProps). Data: `lib/page-data/product.server.js`.
 */

import { cache } from "react";
import { notFound } from "next/navigation";
import PageSchemas from "@/components/seo/PageSchemas";
import ProductView from "@/views/ProductView";
import { loadProductPage } from "@/lib/page-data/product.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Cached and rebuilt every 5 minutes (ISR, like Nahara's catalog pages);
// each rebuild reads the gateway afresh (kit 1.2.2), and the CDN serves it.
export const revalidate = 300; // literal: Next reads it at build (= STORE_REVALIDATE_SECONDS)

// No page is built ahead (no build-time API call): each is rendered on its
// first visit, then cached like the others.
export async function generateStaticParams() {
  return [];
}

// One read for the metadata and the page.
const getPage = cache(async (slug) => await loadProductPage({ slug }));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getPage(slug);
  if (result.notFound) return {};
  return toMetadata(result.props.meta, `/product/${slug}`);
}

export default async function Page({ params }) {
  const { slug } = await params;
  const result = await getPage(slug);
  if (result.notFound) notFound();
  const { meta, ...viewProps } = result.props;
  const { data, reviews, reviewSummary } = viewProps;
  return (
    <>
      {/* PRD-032 FR-D1: the rating JSON-LD comes from the same reviews */}
      <PageSchemas
        meta={meta}
        path={`/product/${slug}`}
        productData={{ ...data, reviewSummary, jsonLdReviews: reviews }}
      />
      <ProductView {...viewProps} />
    </>
  );
}
