/**
 * /category/[slug] (kit PRD-002 FR-3.1; was `pages/category/[slug].jsx`
 * with getServerSideProps). Data: `lib/page-data/listing.server.js`.
 */

import { cache } from "react";
import { notFound } from "next/navigation";
import PageSchemas from "@/components/seo/PageSchemas";
import ProductListing from "@/components/listing/ProductListing";
import { loadCategoryPage } from "@/lib/page-data/listing.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, as getServerSideProps was.
export const dynamic = "force-dynamic";

// One read for the metadata and the page (keyed by value, not identity).
const getPageByKey = cache(async (key) => {
  const { params, searchParams } = JSON.parse(key);
  return await loadCategoryPage(params, searchParams);
});
const getPage = (params, searchParams) =>
  getPageByKey(JSON.stringify({ params, searchParams }));

export async function generateMetadata({ params, searchParams }) {
  const result = await getPage(await params, await searchParams);
  if (result.notFound) return {};
  return toMetadata(result.props.meta, `/category/${result.props.category.slug}`);
}

export default async function Page({ params, searchParams }) {
  const result = await getPage(await params, await searchParams);
  if (result.notFound) notFound();
  const { props } = result;
  const { category } = props;
  return (
    <>
      <PageSchemas meta={props.meta} path={`/category/${category.slug}`} />
      <ProductListing
        // A new category starts a new list (no stale "Load more" state).
        key={`${category.slug}:${props.sort}`}
        title={category.name}
        description={category.description}
        products={props.products}
        totalCount={props.totalCount}
        filters={props.filters}
        sort={props.sort}
        categories={props.categories}
        activeSlug={category.slug}
        listName={`Category: ${category.name}`}
        loadError={props.loadError}
      />
    </>
  );
}
