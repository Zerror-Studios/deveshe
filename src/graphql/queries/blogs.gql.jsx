import { gql } from "@apollo/client";

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
          sizes
          type
          width
        }
        slug
        excerpt
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
        sizes
        width
        type
      }
      content
      excerpt
      slug
      title
      publishedAt
      meta {
        author
        canonical
        createdAt
        description
        keywords
        og {
          description
          image
          title
          updatedAt
          createdAt
        }
        primaryKeywords
        robots
        title
        twitter {
          card
          description
          image
          title
          updatedAt
          createdAt
        }
        updatedAt
      }
    }
  }
`;
