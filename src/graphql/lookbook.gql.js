import { gql } from "@apollo/client";

export const GET_LOOKBOOKS = gql`
	query GetClientSideLookBooks($limit: Int, $offset: Int) {
		getClientSideLookBooks(limit: $limit, offset: $offset) {
			lookBooks {
				_id
				name
				subName
				status
				description
				assets {
					path
					type
					altText
				}
				sections {
					imageUrl
					videourl
					paragraph
				}
			}
		}
	}
`;
