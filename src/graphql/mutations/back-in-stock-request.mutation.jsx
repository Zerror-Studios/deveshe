import { gql } from "@apollo/client";

export const CREATE_BACK_IN_STOCK_REQUEST = gql`
  mutation RequestBackInStock($input: BackInStockInput!) {
    requestBackInStock(input: $input) {
      _id
    }
  }
`;

// CP-22: the guest opened the link in the confirmation email.
export const CONFIRM_BACK_IN_STOCK = gql`
  mutation ConfirmBackInStock($token: String!) {
    confirmBackInStock(token: $token)
  }
`;
