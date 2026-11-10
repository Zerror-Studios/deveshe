/**
 * / (kit PRD-002 FR-3.1; was `pages/index.jsx` with getServerSideProps).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import HomeView from "@/views/HomeView";
import { HOME_META, loadHomePage } from "@/lib/page-data/home.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, as getServerSideProps was.
export const dynamic = "force-dynamic";

export const metadata = toMetadata(HOME_META, "/");

export default async function Page() {
  const data = await loadHomePage();
  return (
    <>
      <PageSchemas meta={HOME_META} path="/" />
      <HomeView {...data} />
    </>
  );
}
