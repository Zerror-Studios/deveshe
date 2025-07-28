import { gql } from "@apollo/client";

export const USER_ADDRESS_LIST = gql`
  query GetAddressByFilters(
    $filter: AddressFilterInput
    $limit: Int
    $offset: Int
    $sort: AddressSortInput
  ) {
    getAddressByFilters(
      limit: $limit
      offset: $offset
      sort: $sort
      filter: $filter
    ) {
      data {
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
      totalCount
    }
  }
`;
