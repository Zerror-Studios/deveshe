/**
 * The JSON-LD every page carries (kit PRD-002 FR-3.1).
 *
 * Was the `<Head>` part of `SeoHeader.jsx`; the tags themselves now come
 * from `generateMetadata` (`lib/seo-metadata.util.js`). It renders in the
 * page body, which search engines read the same way, and uses no hooks,
 * so a server page can render it with its route's `path`.
 */

import React from "react";
import WebPageSchema from "./WebPageSchema";
import NewsMediaOrganizationSchema from "./NewsMediaOrganizationSchema";
import SiteNavigationSchema from "./SiteNavigationSchema";
import ProductSchema from "./ProductSchema";
import { Const } from "@/utils/Constant";
import { SITE_NAME, toCanonical } from "@/lib/seo-metadata.util";

// ─── Constants ────────────────────────────────────────────────────────────

const ORGANIZATION_ADDRESS = {
  streetAddress:
    "Bankeybihari Holdings B5, 3rd floor, Everest Apt., Pt. Madan Mohan Malviya Marg, Tardeo",
  addressLocality: "Mumbai",
  addressRegion: "Maharashtra",
  postalCode: "400034",
  addressCountry: "IN",
};

const ORGANIZATION_CONTACT = {
  telephone: "+919833983775",
  contactType: "Customer Service",
  areaServed: "IN",
  availableLanguage: "English",
};

const ORGANIZATION_PROFILES = [
  "https://www.instagram.com/DeVeSheDreams/",
  "https://www.linkedin.com/company/DeVeSheDreams/",
  "https://www.facebook.com/DeVeSheDreams",
];

// ─── Component ────────────────────────────────────────────────────────────

const PageSchemas = ({ meta, path = "/", productData }) => {
  const url = toCanonical(meta, path);
  return (
    <>
      <WebPageSchema
        name={meta?.title ?? ""}
        description={meta?.description ?? ""}
        url={url}
      />
      <NewsMediaOrganizationSchema
        name={SITE_NAME}
        clientLink={`${Const.ClientLink}/`}
        logoUrl={`${Const.ClientLink}/favicon.jpeg`}
        address={ORGANIZATION_ADDRESS}
        contact={ORGANIZATION_CONTACT}
        sameAs={ORGANIZATION_PROFILES}
      />
      <SiteNavigationSchema />
      {productData && <ProductSchema product={productData} />}
    </>
  );
};

export default PageSchemas;
