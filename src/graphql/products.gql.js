import { gql } from "@apollo/client";

// Product Queries
export const GET_PRODUCTS = gql`
	query GetProducts($limit: Int, $offset: Int, $category: String, $search: String) {
		products(limit: $limit, offset: $offset, category: $category, search: $search) {
			id
			name
			description
			price
			imageUrl
			category {
				id
				name
			}
			inStock
			createdAt
			updatedAt
		}
	}
`;

export const GET_PRODUCT_BY_ID = gql`
	query GetProductById($id: ID!) {
		product(id: $id) {
			id
			name
			description
			price
			imageUrl
			category {
				id
				name
			}
			inStock
			reviews {
				id
				rating
				comment
				user {
					id
					name
				}
				createdAt
			}
			createdAt
			updatedAt
		}
	}
`;
