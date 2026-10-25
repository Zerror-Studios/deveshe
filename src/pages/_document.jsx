import { Html, Head, Main, NextScript } from "next/document";
import { getConsentDefaultScript } from "@/utils/consent.util";

// PRD-014 FR-1.9 (UX-05): only the Consent Mode v2 defaults ("denied") run
// here. GA and GTM load after consent (`components/common/ConsentBanner.jsx`),
// so no tag request happens before the shopper answers.
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{ __html: getConsentDefaultScript() }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
