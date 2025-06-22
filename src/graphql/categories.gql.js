import { gql } from "@apollo/client";

// Category Queries
export const GET_CLIENT_SIDE_CATEGORIES = gql`
	query GetClientSideCategories($limit: Int, $offset: Int, $filter: CategoriesFilterInput) {
		getClientSideCategories(limit: $limit, offset: $offset, filter: $filter) {
			totalCount
			categories {
				name
				products {
					_id
				}
				imgsrc
				_id
			}
		}
	}
`;

export const GET_CLIENT_SIDE_CATEGORY = gql`
	query GetClientSideCategory($getClientSideCategoryId: ID!) {
		getClientSideCategory(id: $getClientSideCategoryId) {
			_id
			name
			products {
				_id
				name
				description
			}
		}
	}
`;
