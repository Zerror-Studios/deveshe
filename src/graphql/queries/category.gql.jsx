import { gql } from "@apollo/client";

// PRD-014 FR-0.8: storefront categories (special categories are excluded
// by the server). `filter.slug` resolves one category for /category/[slug].
export const GET_CATEGORIES = gql`
  query GetClientSideCategories(
    $limit: Int
    $offset: Int
    $filter: CategoriesFilterInput
  ) {
    getClientSideCategories(limit: $limit, offset: $offset, filter: $filter) {
      categories {
        _id
        name
        slug
        description
        seo {
          title
          description
        }
      }
      totalCount
    }
  }
`;
