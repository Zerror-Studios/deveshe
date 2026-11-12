import { gql } from "@apollo/client";

// Update Profile
export const UPDATE_MY_PROFILE = gql`
  mutation UpdateMyProfile($input: CreateUserInput!) {
    updateMyProfile(input: $input) {
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

// Password reset (PRD-003 FR-0.5): the request answers the same way for any
// email; the reset consumes the emailed token once.
export const CUSTOMER_REQUEST_PASSWORD_RESET = gql`
  mutation CustomerRequestPasswordReset($email: String!) {
    customerRequestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export const CUSTOMER_RESET_PASSWORD = gql`
  mutation CustomerResetPassword($token: String!, $newPassword: String!) {
    customerResetPassword(token: $token, newPassword: $newPassword)
  }
`;
