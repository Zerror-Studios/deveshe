/**
 * /blogs: the store's published blog posts (live site design, main
 * 2026-05), from the new API. Rendered per request.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import BlogsView from "@/views/BlogsView";
import { BLOGS_META, loadBlogsPage } from "@/lib/page-data/blog.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Cached and rebuilt every 5 minutes (ISR, like Nahara's catalog pages);
// each rebuild reads the gateway afresh (kit 1.2.2), and the CDN serves it.
export const revalidate = 300; // literal: Next reads it at build (= STORE_REVALIDATE_SECONDS)

export const metadata = toMetadata(BLOGS_META, "/blogs");

export default async function Page() {
  const data = await loadBlogsPage();
  return (
    <>
      <PageSchemas meta={BLOGS_META} path="/blogs" />
      <BlogsView {...data} />
    </>
  );
}
