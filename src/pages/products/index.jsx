/**
 * All products (PRD-014 FR-0.8, UX-01 / D9)
 *
 * Every published product, newest first unless `?sort=` asks otherwise
 * (W2-STORE), 12 per page with "Load more", plus the category chips. Server rendered so the
 * first page is indexable; a failed load renders an error state.
 */

import React from "react";

import SeoHeader from "@/components/seo/SeoHeader";
import ProductListing, {
  LISTING_PAGE_SIZE,
} from "@/components/listing/ProductListing";
import {
  createServerCatalogClient,
  fetchCategories,
  fetchProductPage,
  toListingFilters,
} from "@/lib/catalog-listing.server";
import { Const } from "@/utils/Constant";
import { parseListingSort } from "@/utils/listing-sort.util";

const PRODUCTS_TITLE = "Shop All – DeVeSheDreams";
const PRODUCTS_DESCRIPTION =
  "Shop every DeVeSheDreams piece: wearable art from capsule collections made with artists across disciplines.";

const ProductsPage = ({
  meta,
  products,
  totalCount,
  categories,
  filters,
  sort,
  loadError,
}) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <ProductListing
        // A new sort starts a new list (no stale "Load more" state).
        key={sort}
        title="Shop all"
        products={products}
        totalCount={totalCount}
        filters={filters}
        sort={sort}
        categories={categories}
        listName="All products"
        loadError={loadError}
      />
    </>
  );
};

export default ProductsPage;

export async function getServerSideProps({ query }) {
  const sort = parseListingSort(query?.sort);
  const meta = {
    title: PRODUCTS_TITLE,
    description: PRODUCTS_DESCRIPTION,
    keywords: "DeVeSheDreams, shop, wearable art, capsule collections",
    author: "DeVeSheDreams",
    robots: "index, follow",
    // Query strings never change the first page, so never canonicalise them.
    canonical: `${Const.ClientLink}/products`,
    og: { title: PRODUCTS_TITLE, description: PRODUCTS_DESCRIPTION },
    twitter: {
      card: "summary_large_image",
      title: PRODUCTS_TITLE,
      description: PRODUCTS_DESCRIPTION,
    },
  };
  const filters = toListingFilters();
  const client = createServerCatalogClient();
  const [productResult, categoryResult] = await Promise.allSettled([
    fetchProductPage(client, {
      filters,
      sort,
      limit: LISTING_PAGE_SIZE,
    }),
    fetchCategories(client),
  ]);
  if (productResult.status === "rejected") {
    console.error("Products page load failed:", productResult.reason?.message);
  }

  return {
    props: {
      meta,
      filters,
      sort,
      products: productResult.value?.products || [],
      totalCount: productResult.value?.totalCount || 0,
      categories: categoryResult.value || [],
      loadError: productResult.status === "rejected",
    },
  };
}
