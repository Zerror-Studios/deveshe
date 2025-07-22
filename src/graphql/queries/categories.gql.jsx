import { gql } from "@apollo/client";

// Category Queries
export const GET_CLIENT_SIDE_CATEGORIES = gql`
  query GetClientSideCategories(
    $offset: Int
    $limit: Int
    $filter: CategoriesFilterInput
  ) {
    getClientSideCategories(offset: $offset, limit: $limit, filter: $filter) {
      categories {
        _id
        name
        imgsrc
        products {
          _id
          name
          description
          assets {
            path
            type
            altText
            isFeatured
            _id
          }
          discountedPrice
          price
        }
      }
      totalCount
    }
  }
`;

export const GET_CLIENT_SIDE_CATEGORY = gql`
  query GetClientSideCategory($getClientSideCategoryId: ID!) {
    getClientSideCategory(id: $getClientSideCategoryId) {
      _id
      name
      products {
        _id
        name
        description
      }
    }
  }
`;
