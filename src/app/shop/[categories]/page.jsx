import React from "react";
import { notFound } from "next/navigation";
import {
  GET_CLIENT_SIDE_CATEGORIES,
  GET_CLIENT_SIDE_CATEGORY_BY_SLUG,
  GET_LOOKBOOKS,
} from "@/graphql";
import { createApolloClientServer } from "@/lib/apolloClient.server";
import { ProductStatus } from "@/utils/Constant";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

const fallbackMeta = {
  title: "Shop | DeVeSheDreams",
  description: "Browse DeVeSheDreams collections.",
};

export async function generateMetadata({ params }) {
  const { categories: slug = "" } = await params;
  if (!slug) return fallbackMeta;

  try {
    const client = createApolloClientServer();
    const { data } = await client.query({
      query: GET_CLIENT_SIDE_CATEGORY_BY_SLUG,
      variables: { slug },
    });
    const cat = data?.getClientSideCategory;
    const meta = cat?.meta;
    if (!cat) return fallbackMeta;

    return {
      title: meta?.title || `${cat.name || "Shop"} | DeVeSheDreams`,
      description: meta?.description || fallbackMeta.description,
      robots: meta?.robots,
      keywords: meta?.keywords,
      openGraph: meta?.og
        ? {
            title: meta.og.title,
            description: meta.og.description,
            images: meta.og.image ? [{ url: meta.og.image }] : undefined,
          }
        : undefined,
    };
  } catch {
    return fallbackMeta;
  }
}

export default async function CategoriesPage({ params }) {
  const { categories: slug = "" } = await params;
  if (!slug) notFound();

  const client = createApolloClientServer();
  let category = null;
  let categories = [];
  let lookbooks = [];

  try {
    const [categoryRes, categoriesRes, lookbooksRes] = await Promise.all([
      client.query({
        query: GET_CLIENT_SIDE_CATEGORY_BY_SLUG,
        variables: { slug },
      }),
      client.query({
        query: GET_CLIENT_SIDE_CATEGORIES,
        variables: { offset: 0, limit: 100, filter: {} },
      }),
      client.query({
        query: GET_LOOKBOOKS,
        variables: {
          offset: 0,
          limit: 100,
          filter: { status: ProductStatus.PUBLISHED },
        },
      }),
    ]);
    category = categoryRes?.data?.getClientSideCategory ?? null;
    categories = categoriesRes?.data?.getClientSideCategories?.categories || [];
    lookbooks = lookbooksRes?.data?.getClientSideLookBooks?.lookBooks || [];
  } catch (error) {
    console.error("Error fetching category by slug:", error?.message);
  }

  if (!category) notFound();

  const productData = category?.products || [];

  return (
    <CategoriesClient
      productData={productData}
      categories={categories}
      lookbooks={lookbooks}
      heroImageSrc={category?.imgsrc || undefined}
      categoryName={category?.name || "Shop"}
      categoryDescription={category?.description || ""}
      currentCategorySlug={slug}
    />
  );
}
