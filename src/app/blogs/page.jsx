import { BLOG_POSTS } from "@/data/blogs";
import BlogsClient from "./BlogsClient";

export default function BlogsPage() {
  return <BlogsClient posts={BLOG_POSTS} />;
}
