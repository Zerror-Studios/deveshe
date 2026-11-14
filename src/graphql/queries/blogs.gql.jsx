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
