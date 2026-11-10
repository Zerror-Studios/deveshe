/**
 * The store facts the kit needs before any API call (kit PRD-002 FR-4.1):
 * the backend has no public store-info query, so they live here.
 */

import { defineZcomConfig } from "@zcom/storefront-kit/core";

import { Const } from "@/utils/Constant";
import { REASON_MESSAGES } from "@/utils/api-error.util";

export const zcomConfig = defineZcomConfig({
  storeName: "Deveshe Dreams",
  siteUrl: Const.ClientLink,
  // The JSON-LD logo (the nav logo is split into letter images)
  logoUrl: `${Const.ClientLink}/favicon.jpeg`,
  defaultCurrency: "INR",
  locale: "en-IN",
  // PRD-013: GA4 item ids are the variant SKU in this store
  itemIdFrom: "sku",
  socialLinks: ["https://www.instagram.com/de_ve_she_dreams"],
  // The store's own copy for error reasons (kit messages fill the rest)
  errorMessages: REASON_MESSAGES,
});
