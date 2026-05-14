import React from "react";
import { notFound } from "next/navigation";
import { GET_CLIENT_SIDE_CATEGORY_BY_SLUG } from "@/graphql";
import { createApolloClientServer } from "@/lib/apolloClient.server";
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

  try {
    const { data } = await client.query({
      query: GET_CLIENT_SIDE_CATEGORY_BY_SLUG,
      variables: { slug },
    });
    category = data?.getClientSideCategory ?? null;
  } catch (error) {
    console.error("Error fetching category by slug:", error?.message);
  }

  if (!category) notFound();

  const productData = category?.products || [];

  return (
    <CategoriesClient
      productData={productData}
      heroImageSrc={category?.imgsrc || undefined}
      categoryName={category?.name || "Shop"}
    />
  );
}
