"use client";

/**
 * One lookbook (backend PRD-027), in the chapter design: the hero (cover,
 * title, subtitle, intro), the featured products, then each look in its
 * layout. A lookbook whose looks fit the live site's chapter slots (every
 * migrated one) shows them there: video, banner, one image, two images,
 * image + scrolling image; one built in the dashboard with hotspots,
 * tagged products or SPLIT/GRID looks uses `LookSection` per look. Sends
 * `lookbook_view` once per lookbook and `lookbook_hotspot_click` per opened
 * dot; product clicks carry the lookbook's `item_list_id` (PRD-027 FR-8,
 * F10).
 */

import React, { useEffect } from "react";
import LookBookHero from "@/components/lookbookChapter/LookBookHero";
import LookSection from "@/components/lookbookChapter/LookSection";
import BannerContainer from "@/components/lookbookChapter/BannerContainer";
import ImageSectionOne from "@/components/lookbookChapter/ImageSectionOne";
import ImageSectionThree from "@/components/lookbookChapter/ImageSectionThree";
import ImageSectionTwo from "@/components/lookbookChapter/ImageSectionTwo";
import VideoContainer from "@/components/lookbookChapter/VideoContainer";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import {
  lookbookItemListId,
  trackLookbookHotspotClick,
  trackLookbookView,
} from "@/utils/analytics-events.util";
import {
  featuredProducts,
  sortLooks,
  toChapterSections,
} from "@/utils/lookbook.util";

// ─── Chapter slots ────────────────────────────────────────────────────────

const ChapterSections = ({ sections, alt }) => (
  <>
    {sections[0] && <VideoContainer data={sections[0]} />}
    {sections[1] && <BannerContainer data={sections[1]} alt={alt} />}
    {sections[2] && <ImageSectionOne data={sections[2]} />}
    {(sections[3] || sections[4]) && (
      <ImageSectionTwo leftData={sections[3]} rightData={sections[4]} />
    )}
    {(sections[5] || sections[6]) && (
      <ImageSectionThree leftData={sections[5]} rightData={sections[6]} />
    )}
  </>
);

// ─── View ─────────────────────────────────────────────────────────────────

const LookbookDetail = ({ lookbook }) => {
  const slug = lookbook?.slug || "";
  const listName = `Lookbook: ${lookbook?.title || ""}`;
  const listId = lookbookItemListId(slug);

  useEffect(() => {
    if (slug) trackLookbookView(slug);
  }, [slug]);

  const chapterSections = toChapterSections(lookbook?.looks);

  const openHotspot = (position, itemId) =>
    trackLookbookHotspotClick(slug, position, itemId);

  return (
    <>
      <LookBookHero
        title={lookbook?.title || ""}
        subheading={lookbook?.subtitle || ""}
        description={lookbook?.intro || ""}
        asset={{
          path: lookbook?.cover?.url || "",
          altText: lookbook?.cover?.alt || "",
        }}
      />
      <ProductContainer
        data={featuredProducts(lookbook)}
        listName={listName}
        listId={listId}
      />
      {chapterSections ? (
        <ChapterSections
          sections={chapterSections}
          alt={lookbook?.title || ""}
        />
      ) : (
        sortLooks(lookbook?.looks).map((look) => (
          <LookSection
            key={look._id}
            look={look}
            listName={listName}
            listId={listId}
            onHotspotOpen={openHotspot}
          />
        ))
      )}
    </>
  );
};

export default LookbookDetail;
