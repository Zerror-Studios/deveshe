import { gql } from "@apollo/client";

export const CREATE_BACK_IN_STOCK_REQUEST = gql`
  mutation RequestBackInStock($input: BackInStockInput!) {
    requestBackInStock(input: $input) {
      _id
    }
  }
`;
