import React, { Suspense } from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import ChapterList from "@/components/lookbook/ChapterList";
import { createApolloClient } from "@/lib/apolloClient";
import { GET_LOOKBOOKS } from "@/graphql";

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
    title: "Lookbook – Explore DeVeSheDreams Collections",
    description:
      "Browse the DeVeSheDreams lookbook to explore our bold, dream-inspired collections. Discover vibrant prints, artist-led designs, and wearable creativity.",
    keywords:
      "DeVeSheDreams lookbook, fashion capsule collection, artistic fashion photos, designer collection showcase",
    author: "DeVeSheDreams",
    robots: "index, follow",
  };

  try {
    const client = createApolloClient();
    const { data } = await client.query({
      query: GET_LOOKBOOKS,
      variables: {
        offset: 0,
        limit: 10,
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
