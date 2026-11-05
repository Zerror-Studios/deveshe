import { gql } from "@apollo/client";

// 1. Price the cart on the server and request the stock hold. `attribution`
//    and `consent` (PRD-034 FR-1.4) come from `utils/ad-click-ids.util.js`.
export const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSessionFromCart(
    $cartId: ID!
    $shippingAddress: OrderAddressInput
    $billingAddress: OrderAddressInput
    $promotionCode: String
    $attribution: OrderAttributionInput
    $consent: CheckoutConsentInput
  ) {
    createCheckoutSessionFromCart(
      cartId: $cartId
      shippingAddress: $shippingAddress
      billingAddress: $billingAddress
      promotionCode: $promotionCode
      attribution: $attribution
      consent: $consent
    ) {
      id
      status
      failureReason
      orderId
      expiresAt
      pricing {
        subtotal
        discount
        tax
        shipping
        total
        pricesIncludeTax
        isFreeShipping
      }
    }
  }
`;

// 2. Poll until the stock hold is RESERVED. `pricing` is the server's
//    snapshot (shipping, discount, total) the summary shows (PRD-014 UX-03).
export const GET_CHECKOUT_SESSION = gql`
  query GetCheckoutSession($id: ID!) {
    getCheckoutSession(id: $id) {
      id
      status
      failureReason
      orderId
      expiresAt
      pricing {
        subtotal
        discount
        tax
        shipping
        total
        pricesIncludeTax
        isFreeShipping
      }
    }
  }
`;

// 3. Create the UN_PAID order (idempotent per session); a ₹0 total is
//    placed PAID at once (PRD-014 COM-08), see `pricing.total`.
export const COMPLETE_CHECKOUT = gql`
  mutation CompleteCheckout($checkoutId: ID!) {
    completeCheckout(checkoutId: $checkoutId) {
      id
      status
      failureReason
      orderId
      pricing {
        total
      }
    }
  }
`;

// 4. Payment session for the order on the store's active payment app
//    (amount is the server total). `checkout` says how to open it (PRD-011).
export const CREATE_PAYMENT_SESSION = gql`
  mutation CreatePaymentSession($input: CreatePaymentSessionInput!) {
    createPaymentSession(input: $input) {
      paymentId
      orderId
      providerOrderId
      amount
      currency
      provider
      checkout {
        provider
        mode
        environment
        scriptUrl
        sdk
        redirectUrl
        formAction
        formFields
      }
    }
  }
`;

// 5. Server-to-server verification of the provider's response
export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($payload: JSON!) {
    verifyPayment(payload: $payload) {
      success
      status
      orderId
      paymentId
    }
  }
`;
