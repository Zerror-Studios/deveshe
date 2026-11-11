/**
 * Root layout (kit PRD-002 FR-3.2): `pages/_document.jsx` and the global
 * CSS of `pages/_app.jsx`.
 *
 * PRD-014 FR-1.9 (UX-05): only the Consent Mode v2 defaults run in the
 * head: the kit's `CONSENT_DEFAULT_SCRIPT` ("denied", then a returning
 * shopper's stored choice). The kit's `ZcomTags` loads GA, GTM and the ad
 * tags only after consent (`components/common/ConsentBanner.jsx`), so no
 * tag request happens before the shopper answers.
 */

import Providers from "@/components/layouts/Providers";
import { CONSENT_DEFAULT_SCRIPT } from "@zcom/storefront-kit/core";
import { Const } from "@/utils/Constant";

import "@/styles/globals.css";
import "@/styles/home.css";
import "@/styles/checkout.css";
import "@/styles/checkout2.css";
import "@/styles/address.css";
import "@/styles/profile.css";
import "@/styles/productLoader.css";
import "swiper/css";
import "swiper/css/pagination";

import "@/styles/components/sizeAssistance.css";
import "@/styles/components/navbar.css";
import "@/styles/components/login.css";
import "@/styles/components/password-reset.css";
import "@/styles/components/home.css";
import "@/styles/components/about.css";
import "@/styles/components/legal.css";
import "@/styles/components/lookBook.css";
import "@/styles/components/contact.css";
import "@/styles/components/cart.css";
import "@/styles/components/success.css";
import "@/styles/components/pay.css";
import "@/styles/components/newPorfile.css";
import "@/styles/components/common/polaroid.css";
import "@/styles/components/common/productCard.css";
import "@/styles/components/common/footer.css";
import "@/styles/components/common/consent-banner.css";
import "@/styles/components/product-listing.css";
import "@/styles/components/reviews.css";

// ─── Metadata ─────────────────────────────────────────────────────────────

const FAVICON = "/favicon.jpeg";

export const metadata = {
  metadataBase: new URL(Const.ClientLink),
  icons: {
    icon: [
      { url: FAVICON, sizes: "16x16", type: "image/png" },
      { url: FAVICON, sizes: "32x32", type: "image/png" },
      { url: FAVICON, sizes: "192x192", type: "image/png" },
    ],
    apple: FAVICON,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// ─── Layout ───────────────────────────────────────────────────────────────

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* The two fonts above the fold (headings and body text) */}
        <link
          rel="preload"
          href="/assets/fonts/cob/font-ea9181547d67e56abd65.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/fonts/cob/font-69130470425c85950313.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
