import { gql } from "@apollo/client";

export const CREATE_CONTACT_FORM = gql`
  mutation SubmitContactForm($input: ContactInput!) {
    submitContactForm(input: $input) {
      _id
    }
  }
`;
