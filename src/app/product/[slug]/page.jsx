import React from "react";
import { createApolloClientServer } from "@/lib/apolloClient.server";
import { GET_PRODUCT_BY_ID, GET_PRODUCTS } from "@/graphql";
import { ProductStatus } from "@/utils/Constant";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

const fallbackMeta = {
  title: "DeVeSheDreams – Wear Your Imagination",
  description:
    "DeVeSheDreams is a fashion label that turns dreams into wearable art. Collaborating with artists from different disciplines, we create capsule collections that reflect vibrant expression and individuality.",
  keywords:
    "DeVeSheDreams, wearable art, capsule collections, fashion collaborations, expressive clothing, artistic fashion",
  author: "DeVeSheDreams",
  robots: "index, follow",
};

export async function generateMetadata({ params }) {
  const { slug = "" } = await params;

  try {
    const client = createApolloClientServer();
    const productRes = await client.query({
      query: GET_PRODUCT_BY_ID,
      variables: { slug },
    });
    const meta = productRes?.data?.getClientSideProductById?.meta || fallbackMeta;

    return {
      title: meta?.title || fallbackMeta.title,
      description: meta?.description || fallbackMeta.description,
      robots: meta?.robots || fallbackMeta.robots,
      keywords: meta?.keywords || fallbackMeta.keywords,
      authors: meta?.author ? [{ name: meta.author }] : undefined,
      alternates: meta?.canonical ? { canonical: meta.canonical } : undefined,
      openGraph: meta?.og
        ? {
            title: meta.og.title,
            description: meta.og.description,
            images: meta.og.image ? [{ url: meta.og.image }] : undefined,
            url: meta.canonical,
            siteName: "DeVeSheDreams",
            locale: "en_IN",
            type: "website",
          }
        : undefined,
      twitter: meta?.twitter
        ? {
            card: meta.twitter.card || "summary_large_image",
            title: meta.twitter.title || meta.title,
            description: meta.twitter.description || meta.description,
            images: meta.twitter.image ? [meta.twitter.image] : undefined,
          }
        : undefined,
    };
  } catch {
    return {
      title: fallbackMeta.title,
      description: fallbackMeta.description,
    };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug = "" } = await params;

  const client = createApolloClientServer();
  let data = {};
  let productList = [];

  try {
    const [productRes, productListRes] = await Promise.all([
      client.query({
        query: GET_PRODUCT_BY_ID,
        variables: { slug },
      }),
      client.query({
        query: GET_PRODUCTS,
        variables: {
          offset: 0,
          limit: 5,
          filters: {
            categoryIds: ["6898b3cdddf0354e025da816"],
            status: ProductStatus.PUBLISHED,
            slugNotInclude: slug,
          },
        },
      }),
    ]);

    data = productRes?.data?.getClientSideProductById || {};
    productList = productListRes?.data?.getClientSideProducts?.products || [];
  } catch (error) {
    console.error("Error fetching product page:", error?.message);
  }

  return <ProductDetailClient data={data} productList={productList} />;
}

