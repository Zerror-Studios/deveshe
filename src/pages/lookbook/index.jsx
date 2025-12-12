import React, { Suspense } from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import ChapterList from "@/components/lookbook/ChapterList";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_LOOKBOOKS } from "@/graphql";
import { ProductStatus } from "@/utils/Constant";

const Lookbook = ({ meta, data }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <Suspense fallback={"Loading..."}>
        <ChapterList data={data || []} />
      </Suspense>
    </>
  );
};

export default Lookbook;

export async function getServerSideProps() {
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
      "fashion editorial"
    ],
    primaryKeywords: ["DeVeSheDreams lookbook", "fashion collections"],
    author: "DeVeSheDreams",
    robots: "index, follow",
    og: {
      title: "Lookbook – DeVeSheDreams",
      description:
        "Discover curated outfits and seasonal fashion trends in the DeVeSheDreams Lookbook for style inspiration."
    },
    twitter: {
      card: "summary_large_image",
      title: "Lookbook – DeVeSheDreams",
      description:
        "Browse DeVeSheDreams Lookbook to explore fashion collections, outfit ideas, and seasonal styling inspiration."
    }
  };

  try {
    const client = createApolloClient();
    const { data } = await client.query({
      query: GET_LOOKBOOKS,
      variables: {
        offset: 0,
        limit: 10,
        filter: { status: ProductStatus.PUBLISHED }
      },
    });

    return {
      props: {
        meta,
        data: data?.getClientSideLookBooks?.lookBooks || [],
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      props: {
        meta,
        data: [],
      },
    };
  }
}
