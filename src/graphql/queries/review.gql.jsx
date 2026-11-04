import { gql } from "@apollo/client";

// PRD-014 FR-0.9 (UX-35) and PRD-032: shoppers only ever receive APPROVED
// reviews (the server forces the status). `user` is never selected: the
// server hides it from anyone but the author and moderators; reviews carry
// a `displayName` ("Priya S.") instead. Keep in sync with
// `storefronts/rare-element/src/graphql/queries/review.gql.jsx`.

export const SHOPPER_REVIEW_FIELDS = gql`
  fragment ShopperReviewFields on Review {
    _id
    productId
    rating
    title
    comment
    displayName
    verifiedPurchase
    variantLabel
    featured
    createdAt
    photos {
      key
      url
      width
      height
    }
    storeReply {
      message
      createdAt
    }
  }
`;

// Home (FR-D6): pinned reviews (`filter.featured`), else the latest.
export const GET_REVIEWS = gql`
  query GetReviews($limit: Int, $offset: Int, $filter: ReviewFilterInput) {
    getReviews(limit: $limit, offset: $offset, filter: $filter) {
      data {
        _id
        productId
        rating
        comment
        displayName
        createdAt
        product {
          _id
          name
          slug
        }
      }
      totalCount
    }
  }
`;

// PRD-032 FR-D1: one product's approved reviews, sorted and filtered.
export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews(
    $limit: Int
    $offset: Int
    $filter: ReviewFilterInput
    $sort: ReviewSort
  ) {
    getReviews(limit: $limit, offset: $offset, filter: $filter, sort: $sort) {
      data {
        ...ShopperReviewFields
      }
      totalCount
    }
  }
  ${SHOPPER_REVIEW_FIELDS}
`;

// PRD-032 FR-C2: read on its own (not in the catalog query), so a slow or
// failing reviews service never breaks the product page.
export const GET_PRODUCT_REVIEW_SUMMARY = gql`
  query GetProductReviewSummary($slug: String) {
    getClientSideProductById(slug: $slug) {
      _id
      reviewSummary {
        averageRating
        reviewCount
        distribution
        withPhotosCount
      }
    }
  }
`;

export const GET_STOREFRONT_REVIEW_SETTINGS = gql`
  query GetStorefrontReviewSettings {
    storefrontReviewSettings {
      enabled
      eligibility
      photosEnabled
    }
  }
`;

// FR-A8: the signed-in customer's reviews in every status.
export const GET_MY_REVIEWS = gql`
  query GetMyReviews($limit: Int, $offset: Int) {
    myReviews(limit: $limit, offset: $offset) {
      data {
        ...ShopperReviewFields
        status
        rejectionReason
        product {
          _id
          name
          slug
        }
      }
      totalCount
    }
  }
  ${SHOPPER_REVIEW_FIELDS}
`;

// FR-A8: delivered products not reviewed yet.
export const GET_MY_REVIEWABLE_PRODUCTS = gql`
  query GetMyReviewableProducts($limit: Int, $offset: Int) {
    myReviewableProducts(limit: $limit, offset: $offset) {
      items {
        productId
        orderId
        name
        imageUrl
        deliveredAt
        product {
          _id
          slug
        }
      }
      totalCount
    }
  }
`;

// FR-R3: the products a review link may review (no login).
export const GET_REVIEW_LINK_ORDER = gql`
  query GetReviewLinkOrder($token: String!) {
    reviewLinkOrder(token: $token) {
      orderNo
      displayName
      photosEnabled
      items {
        productId
        name
        imageUrl
        review {
          _id
          rating
          status
        }
      }
    }
  }
`;
