import { gql } from "@apollo/client";

export const CREATE_CONTACT_FORM = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input)
  }
`;
