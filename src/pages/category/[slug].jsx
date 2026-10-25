/**
 * Category listing (PRD-014 FR-0.8, UX-01 / D9)
 *
 * `/category/<slug>` resolves the category with `getClientSideCategories`
 * (`filter.slug`; special categories are never public) and lists its
 * published products, 12 per page with "Load more". An unknown slug is a
 * real 404; a failed product load renders an error state.
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

const CategoryPage = ({
  meta,
  category,
  products,
  totalCount,
  categories,
  filters,
  loadError,
}) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <ProductListing
        // A new category starts a new list (no stale "Load more" state).
        key={category.slug}
        title={category.name}
        description={category.description}
        products={products}
        totalCount={totalCount}
        filters={filters}
        categories={categories}
        activeSlug={category.slug}
        listName={`Category: ${category.name}`}
        loadError={loadError}
      />
    </>
  );
};

export default CategoryPage;

const getUnavailableProps = (slug) => ({
  meta: {
    title: "Shop – DeVeSheDreams",
    description: "This collection is temporarily unavailable.",
    robots: "noindex, nofollow",
    canonical: `${Const.ClientLink}/category/${encodeURIComponent(slug)}`,
  },
  filters: {},
  category: { _id: "", name: "Shop", slug, description: "" },
  products: [],
  totalCount: 0,
  categories: [],
  loadError: true,
});

export async function getServerSideProps({ params }) {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!slug) return { notFound: true };

  const client = createServerCatalogClient();
  let category = null;
  try {
    [category] = await fetchCategories(client, { slug });
  } catch (error) {
    // The API is down: an error state (not indexed), never a fake 404.
    console.error("Category lookup failed:", error?.message);
    return { props: getUnavailableProps(slug) };
  }
  if (!category || category.slug !== slug) return { notFound: true };

  const filters = toListingFilters({ categoryIds: [category._id] });
  const [productResult, categoryResult] = await Promise.allSettled([
    fetchProductPage(client, { filters, limit: LISTING_PAGE_SIZE }),
    fetchCategories(client),
  ]);
  if (productResult.status === "rejected") {
    console.error("Category page load failed:", productResult.reason?.message);
  }

  const title = `${category.seo?.title || category.name} – DeVeSheDreams`;
  const description =
    category.seo?.description ||
    category.description ||
    `Shop ${category.name} at DeVeSheDreams: wearable art from capsule collections made with artists.`;
  const meta = {
    title,
    description,
    keywords: `DeVeSheDreams, ${category.name}, wearable art`,
    author: "DeVeSheDreams",
    robots: "index, follow",
    canonical: `${Const.ClientLink}/category/${encodeURIComponent(slug)}`,
    og: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };

  return {
    props: {
      meta,
      filters,
      category: {
        _id: category._id,
        name: category.name || "",
        slug: category.slug,
        description: category.description || "",
      },
      products: productResult.value?.products || [],
      totalCount: productResult.value?.totalCount || 0,
      categories: categoryResult.value || [],
      loadError: productResult.status === "rejected",
    },
  };
}
