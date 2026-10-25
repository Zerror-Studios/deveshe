import React from "react";
import { Const } from "@/utils/Constant";
import { MenuData } from "@/helpers/MenuData";
import { toJsonLd } from "@/utils/json-ld.util";

// PRD-014 FR-2.8 (UX-33): MenuData items are `{ name, link }`; reading
// `path` produced "…undefined" URLs. Items without both are skipped.
const SiteNavigationSchema = () => {
  const schemaData = MenuData.filter((menu) => menu?.name && menu?.link).map(
    (menu) => ({
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      name: menu.name,
      url: `${Const.ClientLink}${menu.link}`,
    }),
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schemaData) }}
    ></script>
  );
};

export default SiteNavigationSchema;
