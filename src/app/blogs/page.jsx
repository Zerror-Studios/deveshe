/**
 * /blogs: the store's published blog posts (live site design, main
 * 2026-05), from the new API. Rendered per request.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import BlogsView from "@/views/BlogsView";
import { BLOGS_META, loadBlogsPage } from "@/lib/page-data/blog.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, like the other data pages (no build-time API call)
export const dynamic = "force-dynamic";

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
