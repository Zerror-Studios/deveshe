import React, { Suspense } from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import ChapterList from "@/components/lookbook/ChapterList";
import CommonButton from "@/components/common/CommonButton";
import { LookbookChapters } from "@/helpers/LookbookData";

const Lookbook = ({ meta, data }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      {data?.length > 0 ? (
        <Suspense fallback={"Loading..."}>
          <ChapterList data={data} />
        </Suspense>
      ) : (
        <div id="status_section">
          <h2>
            Lookbook <br /> <span>Coming Soon</span>
          </h2>
          <p>
            Our next chapters are being styled. Meanwhile, discover the
            collection.
          </p>
          <CommonButton title={"Shop the Collection"} href={"/products"} />
        </div>
      )}
    </>
  );
};

export default Lookbook;

export async function getStaticProps() {
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

  // Static editorial content: there is no lookbook backend yet.
  return {
    props: {
      meta,
      data: LookbookChapters,
    },
  };
}
