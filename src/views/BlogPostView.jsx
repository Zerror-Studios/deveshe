/**
 * /blogs/<slug>, in the live site's design (main, 2026-05). Data comes from
 * `lib/page-data/blog.server.js`; the body is the kit renderer's HTML
 * (parsed with `parseSafeHtml`, polls and related-posts blocks swapped for
 * components, backend PRD-047).
 */

import React from "react";
import BlogPostDetail from "@/components/blogs/BlogPostDetail";

const BlogPostView = ({ post, relatedPosts = [], relatedBlocks = null }) => (
  <BlogPostDetail
    post={post}
    relatedPosts={relatedPosts}
    relatedBlocks={relatedBlocks}
  />
);

export default BlogPostView;
