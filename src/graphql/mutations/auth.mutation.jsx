import { gql } from "@apollo/client";

// Sign Up
export const SIGN_UP_USER = gql`
  mutation ClientUserSave($input: CreateUserInput!) {
    clientUserSave(input: $input) {
      user {
        _id
        countryCode
        addresses {
          _id
          firstname
          lastname
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
        lastName
        gender
        phoneNumber
        emailSubscribedStatus
        status
      }
      userToken
    }
  }
`;

// Update Profile
export const UPDATE_USER_PROFILE = gql`
  mutation ClientUserUpdate(
    $input: CreateUserInput!
    $clientUserUpdateId: ID!
  ) {
    clientUserUpdate(input: $input, id: $clientUserUpdateId) {
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
    }
  }
`;

// Update Password
export const UPDATE_USER_PASSWORD = gql`
  mutation ChangeUserPassword(
    $email: String!
    $currentPassword: String!
    $newPassword: String!
  ) {
    changeUserPassword(
      email: $email
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      userToken
    }
  }
`;

// Update Status
export const UPDATE_USER_STATUS = gql`
  mutation ChangeUserStatus($email: String!, $status: UserStatusEnum!) {
    changeUserStatus(email: $email, status: $status)
  }
`;
