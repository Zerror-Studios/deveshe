import { gql } from "@apollo/client";

// User Queries
export const LOGIN_USER = gql`
	query UserLogin($email: String!, $password: String!) {
		userLogin(email: $email, password: $password) {
			user {
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

// User Mutations
export const UPDATE_USER_PROFILE = gql`
	mutation ClientUserSave($input: CreateUserInput!) {
		clientUserSave(input: $input) {
			_id
		}
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input) {
			success
			message
		}
	}
`;
