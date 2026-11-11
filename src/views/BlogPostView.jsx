/**
 * /blogs/<slug>, in the live site's design (main, 2026-05). Data comes from
 * `lib/page-data/blog.server.js`; the body is the server-sanitised post HTML
 * (parsed with `parseSafeHtml`).
 */

import React from "react";
import BlogPostDetail from "@/components/blogs/BlogPostDetail";

const BlogPostView = ({ post, relatedPosts = [] }) => (
  <BlogPostDetail post={post} relatedPosts={relatedPosts} />
);

export default BlogPostView;
