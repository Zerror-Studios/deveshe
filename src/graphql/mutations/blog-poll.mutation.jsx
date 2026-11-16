import { gql } from "@apollo/client";

// Backend PRD-047 FR-8 (until kit 1.5.0, see `queries/blogs.gql.jsx`): one
// vote per browser; `voterId` is the `zc_poll_voter` cookie id, and a repeat
// vote changes nothing and returns the current results.
export const VOTE_BLOG_POLL = gql`
  mutation VoteBlogPoll(
    $blogSlug: String!
    $pollId: ID!
    $optionId: ID!
    $voterId: String!
  ) {
    voteBlogPoll(
      blogSlug: $blogSlug
      pollId: $pollId
      optionId: $optionId
      voterId: $voterId
    ) {
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
