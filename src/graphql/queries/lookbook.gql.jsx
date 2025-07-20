import { gql } from "@apollo/client";

export const GET_LOOKBOOKS = gql`
  query GetClientSideLookBooks($limit: Int, $offset: Int) {
    getClientSideLookBooks(limit: $limit, offset: $offset) {
      lookBooks {
        _id
        name
        subName
        status
        description
        assets {
          path
          type
          altText
        }
        sections {
          imageUrl
          videourl
          paragraph
        }
      }
    }
  }
`;

export const GET_LOOKBOOK_BY_ID = gql`
  query GetClientSideLookBookById($getClientSideLookBookByIdId: ID!) {
    getClientSideLookBookById(id: $getClientSideLookBookByIdId) {
      _id
      name
      subName
      status
      description
      totalPrice
      assets {
        path
        type
        altText
        isFeatured
      }
      productIds
      products {
        _id
        name
        description
        assets {
          path
          type
          altText
        }
        price
        discountedPrice
        costOfGoods
        productType
        status
        isDeleted
        variants {
          selectedOptions
          priceDifference
          variantPrice
          sku
          variantCostOfGoods
          shippingWeight
          trackInventory
          stockQuantity
          status
          stockStatus
          visibility
        }
        productOptions {
          choices {
            images
            name
          }
          optionName
          showInProductPageAs
        }
      }
      sections {
        imageUrl
        videourl
        paragraph
      }
    }
  }
`;
