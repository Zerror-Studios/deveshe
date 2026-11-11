import { gql } from "@apollo/client";

// The nav's Lookbook dropdown (desktop and mobile): the store's published
// lookbooks from the catalog (PRD-027 `getClientSideLookbooks`, edge-cached),
// linked by slug like the /lookbook pages.
export const GET_NAV_LOOKBOOKS = gql`
  query GetNavLookbooks($limit: Int) {
    getClientSideLookbooks(limit: $limit) {
      lookbooks {
        _id
        title
        slug
      }
    }
  }
`;
