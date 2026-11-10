/**
 * /products (kit PRD-002 FR-3.1; was `pages/products/index.jsx` with
 * getServerSideProps). Data: `lib/page-data/listing.server.js`.
 */

import { cache } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import ProductListing from "@/components/listing/ProductListing";
import { loadProductsPage } from "@/lib/page-data/listing.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, as getServerSideProps was.
export const dynamic = "force-dynamic";

// One read for the metadata and the page (keyed by value, not identity).
const getPageByKey = cache(
  async (key) => await loadProductsPage(JSON.parse(key)),
);
const getPage = (searchParams) => getPageByKey(JSON.stringify(searchParams));

export async function generateMetadata({ searchParams }) {
  const { props } = await getPage(await searchParams);
  return toMetadata(props.meta, "/products");
}

export default async function Page({ searchParams }) {
  const { props } = await getPage(await searchParams);
  return (
    <>
      <PageSchemas meta={props.meta} path="/products" />
      <ProductListing
        // A new sort starts a new list (no stale "Load more" state).
        key={props.sort}
        title="Shop all"
        products={props.products}
        totalCount={props.totalCount}
        filters={props.filters}
        sort={props.sort}
        categories={props.categories}
        listName="All products"
        loadError={props.loadError}
      />
    </>
  );
}
