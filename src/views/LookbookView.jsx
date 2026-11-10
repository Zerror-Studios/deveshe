"use client";

import React, { Suspense } from "react";
import ChapterList from "@/components/lookbook/ChapterList";
import CommonButton from "@/components/common/CommonButton";
import { LookbookChapters } from "@/helpers/LookbookData";

// Static editorial content: there is no lookbook backend yet.
const Lookbook = () => {
  const data = LookbookChapters;
  return (
    <>
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
