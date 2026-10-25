import { gql } from "@apollo/client";

// Totals are computed on the server; the client never sends prices.
export const CART_LIST = gql`
  query GetCart($guestId: String, $cartId: String) {
    getCart(guestId: $guestId, cartId: $cartId) {
      _id
      userId
      guestId
      itemcount
      totalprice
      discountedPrice
      totalDiscount
      totalTax
      isFreeShippingEnabled
      pricesIncludeTax
      cart {
        productId
        variantId
        name
        sku
        asset {
          _id
          path
          type
          altText
        }
        price
        finalPrice
        qty
        freeQty
        customizations
      }
      promotion {
        promotionId
        promotionCode
        promotionName
        discount
      }
      taxBreakdown {
        name
        rate
        amount
      }
      createdAt
      updatedAt
    }
  }
`;
