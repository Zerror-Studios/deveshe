import { gql } from "@apollo/client";

export const ORDER_LIST = gql`
  query GetOrdersByFilters($offset: Int, $limit: Int, $filter: OrderFilterInput) {
  getOrdersByFilters(offset: $offset, limit: $limit, filter: $filter) {
    data {
      _id
      orderNo
      orderPrice
      paymentStatus
      currency
      fulfillmentStatus
      taxAmount
      itemcount
      totalprice
      discountedPrice
      totalDiscount
      cart {
        name
        description
        asset {
          _id
          path
          type
          isFeatured
          altText
          createdAt
          updatedAt
        }
        qty
        freeQty
        price
        variantDetail {
          variantDetailId
          selectedOptions
          priceDifference
          variantPrice
          variantCostOfGoods
          shippingWeight
          sku
          trackInventory
          stockQuantity
          stockStatus
          status
        }
        finalPrice
        customTexts
        productId
        categoryId
      }
      nimbblInvoiceId
      customDiscount {
        amount
        discountReason
      }
      customFee {
        amount
        name
      }
      createdAt
      updatedAt
      shippingAmount
    }
    totalCount
  }
}
`;
