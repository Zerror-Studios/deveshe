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

export const GET_CLIENT_SIDE_BLOG = gql`
  query GetClientSideBlog($slug: String) {
    getClientSideBlog(slug: $slug) {
      _id
      asset {
        altText
        height
        mediaId
        path
        type
        width
      }
      content
      excerpt
      slug
      title
      publishedAt
      updatedAt
      meta {
        author
        canonical
        description
        keywords
        og {
          description
          image
          title
        }
        primaryKeywords
        robots
        title
        twitter {
          card
          description
          image
          title
        }
      }
    }
  }
`;
