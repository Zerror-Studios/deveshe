import { gql } from "@apollo/client";

// ADD ITEM TO CART
export const ADD_ITEM_TO_CART = gql`
  mutation AddItemToCart($input: CreateCartInput, $guestId: String) {
    addItemToCart(input: $input, guestId: $guestId)
  }
`;

// REMOVE ITEM FORM CART
export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveItemFromCart($input: RemoveItemFromCartInput!) {
    removeItemFromCart(input: $input)
  }
`;

// APPLY COUPON
export const APPLY_CART_COUPON = gql`
  mutation ApplyCartCoupon(
    $couponCode: String!
    $token: String
    $guestId: String
  ) {
    applyCartCoupon(couponCode: $couponCode, token: $token, guestId: $guestId) {
      _id
      userId
      guestId
      itemcount
      totalprice
      discountedPrice
      totalDiscount
      isFreeShippingEnabled
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
        category {
          _id
          name
          imgsrc
          isDeleted
          createdAt
          updatedAt
        }
      }
      nimbblOrderId
      nimbblInvoiceId
      nimbblTransanctionId
      createdAt
      updatedAt
    }
  }
`;

// REMOVE COUPON
export const REMOVE_CART_COUPON = gql`
  mutation RemoveCartCoupon(
    $variantDetail: VariantInput
    $token: String
    $guestId: String
    $productId: String
    $isCompleteRemove: Boolean
  ) {
    removeCartCoupon(
      variantDetail: $variantDetail
      token: $token
      guestId: $guestId
      productId: $productId
      isCompleteRemove: $isCompleteRemove
    )
  }
`;
