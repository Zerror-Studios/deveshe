import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import LookBookHero from "@/components/lookbookChapter/LookBookHero";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import BannerContainer from "@/components/lookbookChapter/BannerContainer";
import ImageSectionOne from "@/components/lookbookChapter/ImageSectionOne";
import ImageSectionTwo from "@/components/lookbookChapter/ImageSectionTwo";
import ImageSectionThree from "@/components/lookbookChapter/ImageSectionThree";
import { GET_LOOKBOOK_BY_ID } from "@/graphql";
import { createApolloClient } from "@/lib/apolloClient";

const LookbookDetail = ({ meta, data }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <LookBookHero
        title={data?.name || ""}
        subheading={data?.subName || ""}
        description={data?.description || ""}
        asset={data?.assets?.[0] || {}}
      />
      <ProductContainer data={data?.products || []} />
      <VideoContainer data={data?.sections?.[0] || {}} />
      <BannerContainer data={data?.sections?.[1] || {}} />
      <ImageSectionOne />
      <ImageSectionTwo />
      <ImageSectionThree />
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
