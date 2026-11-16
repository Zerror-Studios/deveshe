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

// ─── Backend PRD-047 (until kit 1.5.0) ────────────────────────────────────
// Same operation names as kit 1.5.0's documents: once `package.json` pins
// it, `test/kit-documents.test.mjs` flags them; replace each with
// `export { GetRelatedBlogsDocument as GET_RELATED_BLOGS } from "@zcom/storefront-kit/graphql";`
// (and `GetBlogPollResultsDocument`, `VoteBlogPollDocument`).

/** FR-9: published posts like this one (category, then tags, then newest). */
export const GET_RELATED_BLOGS = gql`
  query GetRelatedBlogs($slug: String!, $limit: Int) {
    getClientSideRelatedBlogs(slug: $slug, limit: $limit) {
      _id
      title
      slug
      excerpt
      asset {
        altText
        path
      }
    }
  }
`;

/** FR-8: a poll's counts (shown after voting, D4). */
export const GET_BLOG_POLL_RESULTS = gql`
  query GetBlogPollResults($blogSlug: String!, $pollId: ID!) {
    blogPollResults(blogSlug: $blogSlug, pollId: $pollId) {
      pollId
      total
      closed
      options {
        optionId
        votes
      }
    }
  }
`;
