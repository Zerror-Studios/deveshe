"use client";

/**
 * Lookbook chapter (was `pages/lookbook/[slug]/index.jsx`): static editorial
 * content until a lookbook backend exists.
 */

import React from "react";
import LookBookHero from "@/components/lookbookChapter/LookBookHero";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import BannerContainer from "@/components/lookbookChapter/BannerContainer";
import ImageSectionOne from "@/components/lookbookChapter/ImageSectionOne";
import ImageSectionTwo from "@/components/lookbookChapter/ImageSectionTwo";
import ImageSectionThree from "@/components/lookbookChapter/ImageSectionThree";

const LookbookDetail = ({ data }) => {
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
      <ImageSectionOne data={data?.sections?.[2] || {}}/>
      <ImageSectionTwo leftData={data?.sections?.[3] || {}} rightData={data?.sections?.[4] || {}} />
      <ImageSectionThree leftData={data?.sections?.[5] || {}} rightData={data?.sections?.[6] || {}}/>
    </>
  );
};

export default LookbookDetail;
