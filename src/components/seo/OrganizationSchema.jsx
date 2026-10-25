import React from "react";
import { toJsonLd } from "@/utils/json-ld.util";

const OrganizationSchema = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Wealthfusion",
    logo: {
      "@type": "ImageObject",
      url: "https://wealthfusion.co.uk/favicon.jpg",
      width: "1800px",
      height: "900px",
    },
    url: "https://wealthfusion.co.uk/",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(schemaData) }}
    ></script>
  );
};

export default OrganizationSchema;
