import { gql } from "@apollo/client";

// User Login
export const LOGIN_USER = gql`
  query UserLogin($email: String!, $password: String!) {
    userLogin(email: $email, password: $password) {
      user {
        _id
        countryCode
        addresses {
          _id
          addressType
          addressline1
          addressline2
          userId
          flat
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
        profileImg
        dateOfBirth
        email
        firstName
        gender
        lastName
        phoneNumber
      }
      userToken
    }
  }
`;
