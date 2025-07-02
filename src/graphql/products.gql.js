import { gql } from "@apollo/client";

// Product Queries
export const GET_PRODUCTS = gql`
	query GetClientSideProducts($limit: Int, $offset: Int) {
		getClientSideProducts(limit: $limit, offset: $offset) {
			products {
				_id
				name
				description
				assets {
					path
					type
					altText
				}
				price
				discountedPrice
				costOfGoods
				productType
				status
				isDeleted
				variants {
					selectedOptions
					priceDifference
					variantPrice
					sku
					variantCostOfGoods
					shippingWeight
					trackInventory
					stockQuantity
					status
					stockStatus
					visibility
				}
				productOptions {
					choices {
						images
						name
					}
					optionName
					showInProductPageAs
				}
			}
			totalCount
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
