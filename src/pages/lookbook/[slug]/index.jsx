import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import LookBookHero from "@/components/lookbookChapter/LookBookHero";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import BannerContainer from "@/components/lookbookChapter/BannerContainer";
import ImageSectionOne from "@/components/lookbookChapter/ImageSectionOne";
import ImageSectionTwo from "@/components/lookbookChapter/ImageSectionTwo";
import ImageSectionThree from "@/components/lookbookChapter/ImageSectionThree";
import { LookbookChapters } from "@/helpers/LookbookData";

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
      <ImageSectionOne data={data?.sections?.[2] || {}}/>
      <ImageSectionTwo leftData={data?.sections?.[3] || {}} rightData={data?.sections?.[4] || {}} />
      <ImageSectionThree leftData={data?.sections?.[5] || {}} rightData={data?.sections?.[6] || {}}/>
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

  // Static editorial content (no lookbook backend); unknown slug → 404.
  const data = LookbookChapters.find((chapter) => chapter._id === id);
  if (!data) return { notFound: true };

  return {
    props: {
      meta,
      data,
    },
  };
}
