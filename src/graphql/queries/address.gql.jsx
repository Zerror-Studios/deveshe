import { gql } from "@apollo/client";

export const USER_ADDRESS_LIST = gql`
  query GetAddresses {
    getAddresses {
      _id
      firstname
      lastname
      email
      addressType
      flat
      addressline1
      addressline2
      landmark
      phone
      countryCode
      city
      country
      states
      pincode
      primary
      createdAt
      updatedAt
    }
  }
`;
