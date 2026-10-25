import { gql } from "@apollo/client";

// PRD-014 FR-0.9 (UX-35): shoppers only ever receive APPROVED reviews (the
// server forces the status). `user` is never selected: the server hides it
// from anyone but the author and moderators. `productId` keeps the product
// reference resolvable if the server ever projects the requested fields.
export const GET_REVIEWS = gql`
  query GetReviews($limit: Int, $offset: Int, $filter: ReviewFilterInput) {
    getReviews(limit: $limit, offset: $offset, filter: $filter) {
      data {
        _id
        productId
        rating
        comment
        createdAt
        product {
          _id
          name
          slug
        }
      }
      totalCount
    }
  }
`;
