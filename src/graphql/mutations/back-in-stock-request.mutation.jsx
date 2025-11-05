import { gql } from "@apollo/client";

export const CREATE_BACK_IN_STOCK_REQUEST = gql`
  mutation CreateBackInStockRequest($input: CreateBackInStockRequestInput!) {
  createBackInStockRequest(input: $input) {
    message
  }
}
`;
