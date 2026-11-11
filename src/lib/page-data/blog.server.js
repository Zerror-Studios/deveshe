/**
 * Blog page data — SERVER ONLY (the live site's /blogs and /blogs/<slug>,
 * main 2026-05, on the new API: the blog subgraph's `getClientSideBlogs` /
 * `getClientSideBlog`, published posts only).
 *
 * - `/blogs`: every published post, newest first, as listing cards.
 * - `/blogs/<slug>`: the post and up to four others; an unknown slug is a
 *   real 404 (`post: null`), a failed read throws (the error page).
 */

import { createServerQueryClient } from "@/lib/server-query";
import { GET_CLIENT_SIDE_BLOG, GET_CLIENT_SIDE_BLOGS } from "@/graphql";
import { Const } from "@/utils/Constant";
import {
  getRelatedPostsFromList,
  mapBlogForDetail,
  mapBlogForListing,
} from "@/data/blogs";

// ─── Constants ────────────────────────────────────────────────────────────

/** The backend's list cap (clampPagination). */
const BLOG_LIST_LIMIT = 100;
const RELATED_FETCH_LIMIT = 5;

const BLOGS_TITLE = "Blogs – DeVeSheDreams";
const BLOGS_DESCRIPTION =
  "Stories on style, fabric, and wearing what you mean, from the DeVeSheDreams studio.";

export const BLOGS_META = {
  title: BLOGS_TITLE,
  description: BLOGS_DESCRIPTION,
  keywords: ["DeVeSheDreams blog", "style stories", "fabric", "fashion"],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: { title: BLOGS_TITLE, description: BLOGS_DESCRIPTION },
  twitter: {
    card: "summary_large_image",
    title: BLOGS_TITLE,
    description: BLOGS_DESCRIPTION,
  },
};

const POST_FALLBACK_TITLE = "Blog | DeVeSheDreams";
const POST_FALLBACK_DESCRIPTION =
  "Stories on style, fabric, and wearing what you mean.";

// ─── Loaders ──────────────────────────────────────────────────────────────

/** Every published post as a listing card. */
export async function loadBlogsPage() {
  const client = createServerQueryClient();
  const { data } = await client.query({
    query: GET_CLIENT_SIDE_BLOGS,
    variables: { limit: BLOG_LIST_LIMIT, offset: 0 },
  });
  return {
    posts: (data?.getClientSideBlogs?.blogs || [])
      .map(mapBlogForListing)
      .filter(Boolean),
  };
}

/** The raw post (null when the slug is unknown), for metadata and page. */
export async function fetchBlogPost(slug) {
  const client = createServerQueryClient();
  const { data } = await client.query({
    query: GET_CLIENT_SIDE_BLOG,
    variables: { slug },
  });
  return data?.getClientSideBlog || null;
}

/**
 * The post page: the post and a few other posts. Pass the raw post when the
 * page already read it (generateMetadata), so it isn't read twice.
 */
export async function loadBlogPost(slug, rawPost) {
  const client = createServerQueryClient();
  const [blog, list] = await Promise.all([
    rawPost === undefined ? fetchBlogPost(slug) : rawPost,
    client
      .query({
        query: GET_CLIENT_SIDE_BLOGS,
        variables: { limit: RELATED_FETCH_LIMIT, offset: 0 },
      })
      // Related posts are optional
      .catch(() => null),
  ]);
  const post = mapBlogForDetail(blog);
  return {
    post: post?.slug ? post : null,
    relatedPosts: getRelatedPostsFromList(
      list?.data?.getClientSideBlogs?.blogs,
      slug,
    ),
  };
}

/** The page `meta` for a post (the post's own SEO fields first). */
export const toBlogPostMeta = (blog, slug) => {
  const meta = blog?.meta || {};
  const title = meta.title || blog?.title || POST_FALLBACK_TITLE;
  const description =
    meta.description || blog?.excerpt || POST_FALLBACK_DESCRIPTION;
  return {
    title,
    description,
    keywords: meta.keywords,
    author: meta.author || "DeVeSheDreams",
    robots: meta.robots || "index, follow",
    canonical: meta.canonical || `${Const.ClientLink}/blogs/${slug}`,
    og: {
      title: meta.og?.title || title,
      description: meta.og?.description || description,
      image: meta.og?.image || blog?.asset?.path,
    },
    twitter: {
      card: meta.twitter?.card || "summary_large_image",
      title: meta.twitter?.title || title,
      description: meta.twitter?.description || description,
      image: meta.twitter?.image || blog?.asset?.path,
    },
  };
};
