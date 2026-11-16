/**
 * Blog page data — SERVER ONLY (the live site's /blogs and /blogs/<slug>,
 * main 2026-05, on the new API: the blog subgraph's `getClientSideBlogs` /
 * `getClientSideBlog`, published posts only).
 *
 * - `/blogs`: every published post, newest first, as listing cards.
 * - `/blogs/<slug>`: the post and up to four related posts; an unknown slug
 *   is a real 404 (`post: null`), a failed read throws (the error page).
 *
 * Related posts (backend PRD-047 FR-9, FR-11, D5): `getClientSideRelatedBlogs`
 * (same category, then tags, then newest) for the bottom section and for
 * a body `relatedPosts` block with no chosen posts; a block's chosen posts
 * load in one `getClientSideBlogs(filter: { ids })` call. Until the backend
 * serves FR-9 the bottom section falls back to the latest posts.
 */

import { createServerQueryClient } from "@/lib/server-query";
import {
  GET_CLIENT_SIDE_BLOG,
  GET_CLIENT_SIDE_BLOGS,
  GET_RELATED_BLOGS,
} from "@/graphql";
import { Const } from "@/utils/Constant";
import {
  getRelatedPostsFromList,
  mapBlogForDetail,
  mapBlogForListing,
} from "@/data/blogs";
import {
  BLOG_RELATED_POSTS_MAX_IDS,
  getBlogBlocks,
} from "@/utils/kit-blog-content.util";

// ─── Constants ────────────────────────────────────────────────────────────

/** The backend's list cap (clampPagination). */
const BLOG_LIST_LIMIT = 100;
const RELATED_FETCH_LIMIT = 5;
const RELATED_POSTS_LIMIT = 4;

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

// ─── Related posts ────────────────────────────────────────────────────────

/** FR-9's related posts, else (backend not deployed yet) the latest ones. */
async function loadAutomaticRelated(client, slug) {
  try {
    const { data } = await client.query({
      query: GET_RELATED_BLOGS,
      variables: { slug, limit: RELATED_POSTS_LIMIT },
    });
    return (data?.getClientSideRelatedBlogs || [])
      .map(mapBlogForListing)
      .filter(Boolean);
  } catch {
    const list = await client
      .query({
        query: GET_CLIENT_SIDE_BLOGS,
        variables: { limit: RELATED_FETCH_LIMIT, offset: 0 },
      })
      // Related posts are optional
      .catch(() => null);
    return getRelatedPostsFromList(
      list?.data?.getClientSideBlogs?.blogs,
      slug,
      RELATED_POSTS_LIMIT,
    );
  }
}

/** The merchant's chosen posts as listing cards, keyed by id (never this post). */
async function loadChosenPosts(client, ids, slug) {
  if (!ids.length) return {};
  try {
    const { data } = await client.query({
      query: GET_CLIENT_SIDE_BLOGS,
      variables: { limit: ids.length, offset: 0, filter: { ids } },
    });
    const cards = (data?.getClientSideBlogs?.blogs || [])
      .filter((blog) => blog?.slug && blog.slug !== slug)
      .map(mapBlogForListing)
      .filter(Boolean);
    return Object.fromEntries(cards.map((card) => [card._id, card]));
  } catch {
    // Optional: the block then shows nothing
    return {};
  }
}

/**
 * The post page: the post, its related posts and what its body blocks need.
 * Pass the raw post when the page already read it (generateMetadata), so
 * it isn't read twice.
 *
 * `relatedBlocks` is `{ postsById, automatic }` for `BlogBody`. When the
 * body has an automatic related-posts block, the bottom section is left
 * out, so the same cards don't show twice.
 */
export async function loadBlogPost(slug, rawPost) {
  const client = createServerQueryClient();
  const [blog, automatic] = await Promise.all([
    rawPost === undefined ? fetchBlogPost(slug) : rawPost,
    loadAutomaticRelated(client, slug),
  ]);
  const post = mapBlogForDetail(blog);
  if (!post?.slug) {
    return { post: null, relatedPosts: [], relatedBlocks: null };
  }
  const blocks = getBlogBlocks(blog.content).relatedPosts;
  const chosenIds = [...new Set(blocks.flatMap((block) => block.postIds))]
    .slice(0, BLOG_RELATED_POSTS_MAX_IDS);
  const postsById = await loadChosenPosts(client, chosenIds, slug);
  const hasAutomaticBlock = blocks.some((block) => !block.postIds.length);
  return {
    post,
    relatedPosts: hasAutomaticBlock ? [] : automatic,
    relatedBlocks: { postsById, automatic },
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
