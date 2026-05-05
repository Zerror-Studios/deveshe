import React from "react";
import { createApolloClientServer } from "@/lib/apolloClient.server";
import { GET_PRODUCTS } from "@/graphql";
import { ProductStatus } from "@/utils/Constant";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

const meta = {
  title: "DeVeSheDreams – Wear Your Imagination",
  description:
    "DeVeSheDreams is a fashion label that transforms creativity into wearable art. Through collaborative capsule collections crafted with artists across diverse disciplines, we celebrate individuality, expression, and bold personal style.",
  keywords: [
    "DeVeSheDreams",
    "wearable art",
    "capsule collections",
    "fashion collaborations",
    "expressive clothing",
    "artistic fashion",
    "creative apparel",
    "handcrafted fashion",
  ],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "DeVeSheDreams collaborates with multi-disciplinary artists to create expressive, imaginative capsule collections that bring art to life through fashion.",
  },
  twitter: {
    title: "DeVeSheDreams – Wear Your Imagination",
    description:
      "Discover wearable art and expressive fashion with DeVeSheDreams. Crafted through creative collaborations and bold artistic vision.",
    card: "summary_large_image",
  },
};

export async function generateMetadata() {
  return {
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    keywords: meta.keywords,
    authors: [{ name: meta.author }],
    openGraph: {
      title: meta.og.title,
      description: meta.og.description,
      siteName: "DeVeSheDreams",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: meta.twitter.card,
      title: meta.twitter.title,
      description: meta.twitter.description,
    },
  };
}

export default async function HomePage() {
  const client = createApolloClientServer();
  let productData = [];

  try {
    const { data } = await client.query({
      query: GET_PRODUCTS,
      variables: {
        offset: 0,
        limit: 1000,
        filters: {
          categoryIds: ["6898b3cdddf0354e025da816"],
          status: ProductStatus.PUBLISHED,
        },
      },
    });
    productData = data?.getClientSideProducts?.products || [];
  } catch (error) {
    console.error("Error fetching home products:", error?.message);
  }

  return <HomeClient productData={productData} />;
}

