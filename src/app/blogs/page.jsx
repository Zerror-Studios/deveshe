import { GET_CLIENT_SIDE_BLOGS } from "@/graphql";
import { mapBlogForListing } from "@/data/blogs";
import { createApolloClientServer } from "@/lib/apolloClient.server";
import BlogsClient from "./BlogsClient";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const client = createApolloClientServer();
  let posts = [];

  try {
    const { data } = await client.query({
      query: GET_CLIENT_SIDE_BLOGS,
      variables: {
        limit: 100,
        offset: 0,
        filter: {},
      },
    });

    posts = (data?.getClientSideBlogs?.blogs || [])
      .map(mapBlogForListing)
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching blogs:", error?.message);
  }

  return <BlogsClient posts={posts} />;
}
