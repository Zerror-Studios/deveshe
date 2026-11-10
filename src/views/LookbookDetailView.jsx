"use client";

/**
 * One lookbook (backend PRD-027), in the chapter design: the hero (cover,
 * title, subtitle, intro), the featured products, then each look in its
 * layout (`components/lookbookChapter/LookSection.jsx`). Sends
 * `lookbook_view` once per lookbook and `lookbook_hotspot_click` per opened
 * dot; product clicks carry the lookbook's `item_list_id` (PRD-027 FR-8,
 * F10).
 */

import React, { useEffect } from "react";
import LookBookHero from "@/components/lookbookChapter/LookBookHero";
import LookSection from "@/components/lookbookChapter/LookSection";
import ProductContainer from "@/components/lookbookChapter/ProductContainer";
import {
  lookbookItemListId,
  trackLookbookHotspotClick,
  trackLookbookView,
} from "@/utils/analytics-events.util";
import { featuredProducts, sortLooks } from "@/utils/lookbook.util";

// ─── View ─────────────────────────────────────────────────────────────────

const LookbookDetail = ({ lookbook }) => {
  const slug = lookbook?.slug || "";
  const listName = `Lookbook: ${lookbook?.title || ""}`;
  const listId = lookbookItemListId(slug);

  useEffect(() => {
    if (slug) trackLookbookView(slug);
  }, [slug]);

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
      {sortLooks(lookbook?.looks).map((look) => (
        <LookSection
          key={look._id}
          look={look}
          listName={listName}
          listId={listId}
          onHotspotOpen={openHotspot}
        />
      ))}
    </>
  );
};

export default LookbookDetail;
