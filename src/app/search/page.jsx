/**
 * /search (kit PRD-002 FR-3.1; was `pages/search/index.jsx` with
 * getServerSideProps). Data: `lib/page-data/listing.server.js`.
 */

import { cache } from "react";
import PageSchemas from "@/components/seo/PageSchemas";
import SearchView from "@/views/SearchView";
import { loadSearchPage } from "@/lib/page-data/listing.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, as getServerSideProps was.
export const dynamic = "force-dynamic";

// One read for the metadata and the page (keyed by value, not identity).
const getPageByKey = cache(
  async (key) => await loadSearchPage(JSON.parse(key)),
);
const getPage = (searchParams) => getPageByKey(JSON.stringify(searchParams));

export async function generateMetadata({ searchParams }) {
  const { props } = await getPage(await searchParams);
  return toMetadata(props.meta, "/search");
}

export default async function Page({ searchParams }) {
  const { props } = await getPage(await searchParams);
  const { meta, ...viewProps } = props;
  return (
    <>
      <PageSchemas meta={meta} path="/search" />
      <SearchView {...viewProps} />
    </>
  );
}
