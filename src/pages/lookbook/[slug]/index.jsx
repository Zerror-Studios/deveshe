import React from "react";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import Section1 from "@/components/lookbookChapter/Section1";
import Section2 from "@/components/lookbookChapter/Section2";
// import Section3 from "@/components/lookbookChapter/Section3";
// import Section4 from "@/components/lookbookChapter/Section4";
// import Section5 from "@/components/lookbookChapter/Section5";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import { GET_LOOKBOOK_BY_ID } from "@/graphql";
import { createApolloClient } from "@/lib/apolloClient";
import SeoHeader from "@/components/seo/SeoHeader";

const LookbookDetail = ({ meta, data }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <Section1
        title={data?.name || ""}
        subheading={data?.subName || ""}
        description={data?.description || ""}
        asset={data?.assets?.[0] || {}}
      />
      <ProductContainer data={data?.products || []} />
      <VideoContainer data={data?.sections?.[0] || {}} />
      <Section2 data={data?.sections?.[1] || {}} />
      {/* <Section3 />
      <Section4 />
      <Section5 /> */}
    </>
  );
};

export default LookbookDetail;

export async function getServerSideProps({ params }) {
  const id = params?.slug || "";
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
      query: GET_LOOKBOOK_BY_ID,
      variables: { getClientSideLookBookByIdId: id },
    });
    return {
      props: {
        meta,
        data: data?.getClientSideLookBookById || {},
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      props: {
        meta,
        data: {},
      },
    };
  }
}
