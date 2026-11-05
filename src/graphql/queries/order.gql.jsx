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
        displayStatus
        currency
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

// One order of the signed-in customer (thank-you page). `userData` and the
// shipping phone feed Google enhanced conversions, hashed in the browser
// and only with marketing consent (PRD-034 FR-1.6).
export const GET_ORDER_BY_ID = gql`
  query MyOrder($id: ID!) {
    myOrder(id: $id) {
      _id
      orderNo
      userData {
        email
        phoneNumber
        countryCode
      }
      shippingAddress {
        email
        phone
        countryCode
      }
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

// PRD-015 FR-20: the order detail page (/profile/orders/[id]). Status,
// tracking, cancel and returns are server-computed fields; the deprecated
// `awb_code`, `courierName` and `trackInfo` are not selected.
export const GET_ORDER_DETAIL = gql`
  query MyOrderDetail($id: ID!) {
    myOrder(id: $id) {
      _id
      orderNo
      orderPrice
      totalprice
      discountedPrice
      totalDiscount
      shippingAmount
      paymentStatus
      currency
      displayStatus
      cancelReason
      deliveredAt
      canCancel
      invoiceUrl
      cart {
        id
        productId
        variantId
        name
        sku
        qty
        finalPrice
        asset {
          _id
          path
          altText
        }
      }
      shippingAddress {
        firstname
        lastname
        addressline1
        addressline2
        city
        states
        country
        pincode
      }
      shipment {
        awb
        courier
        trackingUrl
        tracking
      }
      returnableUntil
      returnableItems {
        orderItemId
        productId
        variantId
        name
        qty
        returnRequestedQty
        returnableQty
      }
      returnRequests {
        id
        status
        refundAmount
        createdAt
        items {
          orderItemId
          name
          quantity
          reason
          condition
        }
      }
      createdAt
    }
  }
`;
