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

// Rendered per request, as getServerSideProps was.
export const dynamic = "force-dynamic";

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
