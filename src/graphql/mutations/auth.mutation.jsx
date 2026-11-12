import { gql } from "@apollo/client";

// Login: also sets the HttpOnly customer refresh cookie (PRD-001 phase 2)
export const CUSTOMER_LOGIN = gql`
  mutation CustomerLogin($input: CustomerLoginInput!) {
    customerLogin(input: $input) {
      accessToken
      expiresIn
      customerId
    }
  }
`;

// Refresh: rotates the session from the HttpOnly customer cookie
export const CUSTOMER_REFRESH_TOKEN = gql`
  mutation CustomerRefreshToken($refreshToken: String) {
    customerRefreshToken(refreshToken: $refreshToken) {
      accessToken
    }
  }
`;

// Logout: revokes the session behind the customer cookie (or the argument)
export const CUSTOMER_LOGOUT = gql`
  mutation CustomerLogout($refreshToken: String) {
    customerLogout(refreshToken: $refreshToken)
  }
`;

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
