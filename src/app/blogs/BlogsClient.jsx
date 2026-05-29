import BlogListing from "@/components/blogs/BlogListing";

export default function BlogsClient({ posts }) {
  return (
    <>
      <BlogListing posts={posts} />
    </>
  );
}
