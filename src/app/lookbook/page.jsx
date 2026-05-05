import React from "react";
import ChapterList from "@/components/lookbook/ChapterList";
import { createApolloClientServer } from "@/lib/apolloClient.server";
import { GET_LOOKBOOKS } from "@/graphql";
import { ProductStatus } from "@/utils/Constant";

export const dynamic = "force-dynamic";

const meta = {
  title: "Lookbook – DeVeSheDreams",
  description:
    "Explore the latest DeVeSheDreams fashion collections in our Lookbook. Get inspired by curated outfits, seasonal trends, and styling ideas.",
  keywords: [
    "DeVeSheDreams lookbook",
    "fashion collections",
    "style inspiration",
    "outfit ideas",
    "seasonal trends",
    "fashion editorial",
  ],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "Lookbook – DeVeSheDreams",
    description:
      "Discover curated outfits and seasonal fashion trends in the DeVeSheDreams Lookbook for style inspiration.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lookbook – DeVeSheDreams",
    description:
      "Browse DeVeSheDreams Lookbook to explore fashion collections, outfit ideas, and seasonal styling inspiration.",
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

export default async function LookbookPage() {
  const client = createApolloClientServer();
  let data = [];

  try {
    const res = await client.query({
      query: GET_LOOKBOOKS,
      variables: {
        offset: 0,
        limit: 10,
        filter: { status: ProductStatus.PUBLISHED },
      },
    });
    data = res?.data?.getClientSideLookBooks?.lookBooks || [];
  } catch (error) {
    console.error("Error fetching lookbooks:", error?.message);
  }

  return <ChapterList data={data} />;
}

