import { gql } from "@apollo/client";

// Save Address
export const USER_ADDRESS_SAVE_OR_UPDATE = gql`
  mutation AddressSaveOrUpdate(
    $input: CreateAddressInput!
    $addressSaveOrUpdateId: ID
  ) {
    addressSaveOrUpdate(input: $input, id: $addressSaveOrUpdateId) {
      _id
      userId
      firstname
      lastname
      addressType
      flat
      addressline1
      addressline2
      landmark
      countryCode
      phone
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
