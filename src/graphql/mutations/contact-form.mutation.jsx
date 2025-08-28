import { gql } from "@apollo/client";

export const CREATE_CONTACT_FORM = gql`
  mutation CreateContactForm($input: CreateContactFormInput!) {
    createContactForm(input: $input)
  }
`;
