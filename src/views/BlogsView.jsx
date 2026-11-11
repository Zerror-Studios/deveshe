"use client";

/**
 * /blogs, in the live site's design (main, 2026-05). Data comes from
 * `lib/page-data/blog.server.js`.
 */

import React from "react";
import BlogListing from "@/components/blogs/BlogListing";

const BlogsView = ({ posts = [] }) => <BlogListing posts={posts} />;

export default BlogsView;
