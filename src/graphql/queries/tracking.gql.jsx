import { gql } from "@apollo/client";

// PRD-034 FR-1.2: the store's public tag ids (no secrets; edge-cached).
// Each field is null when its app isn't set up for the store.
export const STOREFRONT_TRACKING_CONFIG = gql`
  query StorefrontTrackingConfig {
    storefrontTrackingConfig {
      ga4MeasurementId
      metaPixelId
      googleAds {
        conversionId
        purchaseLabel
        addToCartLabel
        beginCheckoutLabel
        enhancedConversions
      }
    }
  }
`;
