import { notFound } from "next/navigation";
import BlogPostDetail from "@/components/blogs/BlogPostDetail";
import { BLOG_POSTS, getBlogBySlug, getRelatedPosts } from "@/data/blogs";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "Blog | DeVeSheDreams" };

  return {
    title: `${post.title} | DeVeSheDreams`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) notFound();

  return (
    <BlogPostDetail post={post} relatedPosts={getRelatedPosts(slug)} />
  );
}
