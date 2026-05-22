import { notFound } from "next/navigation";
import BlogPostDetail from "@/components/blogs/BlogPostDetail";
import { getRelatedPostsFromList, mapBlogForDetail } from "@/data/blogs";
import { GET_CLIENT_SIDE_BLOG, GET_CLIENT_SIDE_BLOGS } from "@/graphql";
import { createApolloClientServer } from "@/lib/apolloClient.server";

export const dynamic = "force-dynamic";

const fallbackMeta = {
  title: "Blog | DeVeSheDreams",
  description:
    "Stories on style, fabric, and wearing what you mean.",
};

export async function generateMetadata({ params }) {
  const { slug = "" } = await params;

  try {
    const client = createApolloClientServer();
    const { data } = await client.query({
      query: GET_CLIENT_SIDE_BLOG,
      variables: { slug },
    });
    const blog = data?.getClientSideBlog;
    const meta = blog?.meta || {};

    return {
      title: meta?.title || blog?.title || fallbackMeta.title,
      description: meta?.description || blog?.excerpt || fallbackMeta.description,
      robots: meta?.robots,
      keywords: meta?.keywords,
      authors: meta?.author ? [{ name: meta.author }] : undefined,
      alternates: meta?.canonical ? { canonical: meta.canonical } : undefined,
      openGraph: meta?.og
        ? {
            title: meta.og.title,
            description: meta.og.description,
            images: meta.og.image ? [{ url: meta.og.image }] : undefined,
            url: meta.canonical,
            siteName: "DeVeSheDreams",
            locale: "en_IN",
            type: "article",
          }
        : undefined,
      twitter: meta?.twitter
        ? {
            card: meta.twitter.card || "summary_large_image",
            title: meta.twitter.title || meta.title,
            description: meta.twitter.description || meta.description,
            images: meta.twitter.image ? [meta.twitter.image] : undefined,
          }
        : undefined,
    };
  } catch {
    return {
      title: fallbackMeta.title,
      description: fallbackMeta.description,
    };
  }
}

export default async function BlogPostPage({ params }) {
  const { slug = "" } = await params;
  const client = createApolloClientServer();

  let post = null;
  let relatedPosts = [];

  try {
    const [blogRes, listRes] = await Promise.all([
      client.query({
        query: GET_CLIENT_SIDE_BLOG,
        variables: { slug },
      }),
      client.query({
        query: GET_CLIENT_SIDE_BLOGS,
        variables: {
          limit: 5,
          offset: 0,
          filter: {},
        },
      }),
    ]);

    post = mapBlogForDetail(blogRes?.data?.getClientSideBlog);
    const blogs = listRes?.data?.getClientSideBlogs?.blogs || [];
    relatedPosts = getRelatedPostsFromList(blogs, slug);
  } catch (error) {
    console.error("Error fetching blog:", error?.message);
  }

  if (!post?.slug) notFound();

  return <BlogPostDetail post={post} relatedPosts={relatedPosts} />;
}
