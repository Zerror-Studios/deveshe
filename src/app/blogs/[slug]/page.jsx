/**
 * /blogs/<slug>: one published post (live site design, main 2026-05), from
 * the new API, with its own SEO fields. An unknown slug is a 404.
 */

import { cache } from "react";
import { notFound } from "next/navigation";
import PageSchemas from "@/components/seo/PageSchemas";
import BlogPostView from "@/views/BlogPostView";
import {
  fetchBlogPost,
  loadBlogPost,
  toBlogPostMeta,
} from "@/lib/page-data/blog.server";
import { toMetadata } from "@/lib/seo-metadata.util";

// Rendered per request, like the other data pages (no build-time API call)
export const dynamic = "force-dynamic";

// One read of the post for the metadata and the page
const getPost = cache((slug) => fetchBlogPost(slug));

export async function generateMetadata({ params }) {
  const { slug = "" } = await params;
  const blog = await getPost(slug);
  if (!blog) return { title: { absolute: "Blog | DeVeSheDreams" } };
  return toMetadata(toBlogPostMeta(blog, slug), `/blogs/${slug}`);
}

export default async function Page({ params }) {
  const { slug = "" } = await params;
  const blog = await getPost(slug);
  if (!blog) notFound();
  const { post, relatedPosts } = await loadBlogPost(slug, blog);
  if (!post) notFound();
  return (
    <>
      <PageSchemas meta={toBlogPostMeta(blog, slug)} path={`/blogs/${slug}`} />
      <BlogPostView post={post} relatedPosts={relatedPosts} />
    </>
  );
}
