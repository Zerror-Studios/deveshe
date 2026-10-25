import { gql } from "@apollo/client";

// Signed-in customer's profile (PRD-002 SF-1)
export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      _id
      authUserId
      firstName
      lastName
      email
      phoneNumber
      countryCode
      gender
      profileImg
      dateOfBirth
      emailSubscribedStatus
      status
    }
  }
`;
