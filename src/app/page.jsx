/**
 * / (kit PRD-002 FR-3.1; was `pages/index.jsx` with getServerSideProps).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import HomeView from "@/views/HomeView";
import { HOME_META, loadHomePage } from "@/lib/page-data/home.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Cached and rebuilt every 5 minutes (ISR, like Nahara's catalog pages);
// each rebuild reads the gateway afresh (kit 1.2.2), and the CDN serves it.
export const revalidate = 300; // literal: Next reads it at build (= STORE_REVALIDATE_SECONDS)

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
