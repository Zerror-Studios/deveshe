import { gql } from "@apollo/client";

// Prices come from variants; there is no product-level price. Stock is the
// coarse PRD-020 signal (`availability`, nullable: null = no signal).
export const GET_PRODUCTS = gql`
  query GetClientSideProducts(
    $limit: Int
    $offset: Int
    $filters: GetProductsFilterInput
    $sort: ClientProductSort
  ) {
    getClientSideProducts(
      limit: $limit
      offset: $offset
      filters: $filters
      sort: $sort
    ) {
      products {
        _id
        name
        assets {
          path
          type
          altText
        }
        productType
        slug
        status
        badgeIds
        # The shop's client-side filters (product type, size)
        categoryIds
        categories {
          _id
          name
          slug
        }
        productOptions {
          optionName
          showInProductPageAs
          choices {
            name
          }
        }
        variants {
          _id
          title
          sku
          optionValues
          price
          compareAtPrice
          status
        }
        availability
      }
      totalCount
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetClientSideProductById($slug: String) {
    getClientSideProductById(slug: $slug) {
      _id
      name
      description
      status
      slug
      categoryIds
      badgeIds
      categories {
        _id
        name
        slug
      }
      additionalInfo {
        title
        description
      }
      productOptions {
        optionName
        choices {
          assetsId
          name
        }
        showInProductPageAs
      }
      assets {
        _id
        path
        type
        altText
      }
      seo {
        title
        description
        keywords
        primaryKeywords
        author
        canonical
        robots
        og {
          title
          description
          image
        }
        twitter {
          card
          title
          description
          image
        }
      }
      variants {
        _id
        title
        sku
        optionValues
        price
        compareAtPrice
        status
        availability
        availableQuantity
      }
      availability
    }
  }
`;

// PRD-014 FR-2.8 (UX-33): one page of product URLs for the sitemap.
export const GET_SITEMAP_PRODUCTS = gql`
  query GetSitemapProducts($limit: Int, $offset: Int, $filters: GetProductsFilterInput) {
    getClientSideProducts(limit: $limit, offset: $offset, filters: $filters) {
      products {
        _id
        slug
        updatedAt
      }
      totalCount
    }
  }
`;

// PRD-020 FR-8: the fresh read for the PDP (mount, variant change) and the
// bag (open). Never cached server-side; at most 50 ids; unknown and
// unpublished ids are left out. A failure keeps the rendered value.
export const GET_VARIANT_AVAILABILITY = gql`
  query GetVariantAvailability($variantIds: [ID!]!) {
    getVariantAvailability(variantIds: $variantIds) {
      productId
      variantId
      availability
      availableQuantity
    }
  }
`;
