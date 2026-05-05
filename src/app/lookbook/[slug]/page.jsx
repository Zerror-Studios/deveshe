import React from "react";
import LookBookHero from "@/components/lookbookChapter/LookBookHero";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import BannerContainer from "@/components/lookbookChapter/BannerContainer";
import ImageSectionOne from "@/components/lookbookChapter/ImageSectionOne";
import ImageSectionTwo from "@/components/lookbookChapter/ImageSectionTwo";
import ImageSectionThree from "@/components/lookbookChapter/ImageSectionThree";
import { GET_LOOKBOOK_BY_ID } from "@/graphql";
import { createApolloClientServer } from "@/lib/apolloClient.server";

export const dynamic = "force-dynamic";

const fallbackMeta = {
  title: "Lookbook – Explore DeVeSheDreams Collections",
  description:
    "Browse the DeVeSheDreams lookbook to explore our bold, dream-inspired collections. Discover vibrant prints, artist-led designs, and wearable creativity.",
  keywords:
    "DeVeSheDreams lookbook, fashion capsule collection, artistic fashion photos, designer collection showcase",
  author: "DeVeSheDreams",
  robots: "index, follow",
};

export async function generateMetadata() {
  return {
    title: fallbackMeta.title,
    description: fallbackMeta.description,
    robots: fallbackMeta.robots,
    keywords: fallbackMeta.keywords,
    authors: [{ name: fallbackMeta.author }],
  };
}

export default async function LookbookDetailPage({ params }) {
  const { slug } = await params;
  const id = slug || "";
  const client = createApolloClientServer();

  let data = {};
  try {
    const res = await client.query({
      query: GET_LOOKBOOK_BY_ID,
      variables: { getClientSideLookBookByIdId: id },
    });
    data = res?.data?.getClientSideLookBookById || {};
  } catch (error) {
    console.error("Error fetching lookbook detail:", error?.message);
  }

  return (
    <>
      <LookBookHero
        title={data?.name || ""}
        subheading={data?.subName || ""}
        description={data?.description || ""}
        asset={data?.assets?.[0] || {}}
      />
      <ProductContainer data={data?.products || []} />
      <VideoContainer data={data?.sections?.[0] || {}} />
      <BannerContainer data={data?.sections?.[1] || {}} />
      <ImageSectionOne data={data?.sections?.[2] || {}} />
      <ImageSectionTwo
        leftData={data?.sections?.[3] || {}}
        rightData={data?.sections?.[4] || {}}
      />
      <ImageSectionThree
        leftData={data?.sections?.[5] || {}}
        rightData={data?.sections?.[6] || {}}
      />
    </>
  );
}

