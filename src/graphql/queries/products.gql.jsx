import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetClientSideProducts($limit: Int, $offset: Int) {
    getClientSideProducts(limit: $limit, offset: $offset) {
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
      totalCount
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetClientSideProductById($getClientSideProductByIdId: ID!) {
    getClientSideProductById(id: $getClientSideProductByIdId) {
      _id
      additionalInfo {
        description
        title
      }
      margin
      discountedPrice
      createdAt
      costOfGoods
      categoryIds
      categories {
        _id
        name
      }
      description
      name
      price
      productOptions {
        optionName
        choices {
          images
          name
        }
        showInProductPageAs
      }
      assets {
        _id
        path
        type
        altText
      }
      saleType
      saleValue
      status
      variants {
        priceDifference
        shippingWeight
        selectedOptions
        status
        variantPrice
        variantCostOfGoods
      }
      ribbon {
        name
        ribbonId
      }
      profit
    }
  }
`;
