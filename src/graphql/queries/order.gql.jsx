import { gql } from "@apollo/client";

// Customer order history (list limits are capped at 100 by the backend)
export const ORDER_LIST = gql`
  query MyOrders($limit: Int, $offset: Int) {
    myOrders(limit: $limit, offset: $offset) {
      orders {
        _id
        orderNo
        orderPrice
        totalprice
        discountedPrice
        paymentStatus
        fulfillmentStatus
        shipmentStatus
        currency
        awb_code
        cart {
          productId
          variantId
          name
          sku
          qty
          price
          finalPrice
          asset {
            _id
            path
            altText
          }
        }
        createdAt
      }
      totalCount
    }
  }
`;

// One order of the signed-in customer (thank-you page)
export const GET_ORDER_BY_ID = gql`
  query MyOrder($id: ID!) {
    myOrder(id: $id) {
      _id
      orderNo
      orderPrice
      totalprice
      discountedPrice
      totalDiscount
      shippingAmount
      paymentStatus
      fulfillmentStatus
      currency
      tax {
        totalTax
      }
      cart {
        productId
        variantId
        name
        sku
        qty
        price
        finalPrice
      }
      createdAt
    }
  }
`;
