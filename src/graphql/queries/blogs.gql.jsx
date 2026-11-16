import { gql } from "@apollo/client";

// Storefront blog reads (blog subgraph `getClientSideBlogs` /
// `getClientSideBlog`; published posts only, edge-cached). `OgMeta` and
// `TwitterMeta` carry no dates on the new API.

export const GET_CLIENT_SIDE_BLOGS = gql`
  query GetClientSideBlogs(
    $limit: Int
    $offset: Int
    $filter: BlogsFilterInput
  ) {
    getClientSideBlogs(limit: $limit, offset: $offset, filter: $filter) {
      totalCount
      blogs {
        _id
        title
        content
        asset {
          altText
          height
          mediaId
          path
          type
          width
        }
        slug
        excerpt
        publishedAt
      }
    }
  }
`;

export { GetBlogDocument as GET_CLIENT_SIDE_BLOG } from "@zcom/storefront-kit/graphql";

// Backend PRD-047 (kit 1.5.0): related posts and a blog poll's results
export {
  GetRelatedBlogsDocument as GET_RELATED_BLOGS,
  GetBlogPollResultsDocument as GET_BLOG_POLL_RESULTS,
} from "@zcom/storefront-kit/graphql";
