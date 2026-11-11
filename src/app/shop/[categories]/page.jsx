/**
 * /shop/[categories] (live site design; data:
 * `lib/page-data/shop.server.js`). One category's published products,
 * filtered and sorted on the client. An unknown slug is a real 404.
 */

import { cache } from "react";
import { notFound } from "next/navigation";
import PageSchemas from "@/components/seo/PageSchemas";
import ShopView from "@/views/ShopView";
import { loadShopCategoryPage } from "@/lib/page-data/shop.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, like the other data pages.
export const dynamic = "force-dynamic";

// One read for the metadata and the page.
const getPage = cache(async (slug) => await loadShopCategoryPage(slug));

const readSlug = async (params) => {
  const { categories } = await params;
  return typeof categories === "string" ? categories : "";
};

export async function generateMetadata({ params }) {
  const result = await getPage(await readSlug(params));
  if (result.notFound) return {};
  const { meta, category } = result.props;
  return toMetadata(meta, `/shop/${category.slug}`);
}

export default async function Page({ params }) {
  const result = await getPage(await readSlug(params));
  if (result.notFound) notFound();
  const { meta, category, products, categories, lookbooks, loadError } =
    result.props;
  return (
    <>
      <PageSchemas meta={meta} path={`/shop/${category.slug}`} />
      <ShopView
        // A new category starts with fresh filters
        key={category.slug}
        category={category}
        products={products}
        categories={categories}
        lookbooks={lookbooks}
        loadError={loadError}
      />
    </>
  );
}
