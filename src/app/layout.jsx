/**
 * Root layout (kit PRD-002 FR-3.2): `pages/_document.jsx` and the global
 * CSS of `pages/_app.jsx`.
 *
 * PRD-014 FR-1.9 (UX-05): only the Consent Mode v2 defaults ("denied")
 * run in the head. GA and GTM load after consent
 * (`components/common/ConsentBanner.jsx`), so no tag request happens
 * before the shopper answers.
 */

import Providers from "@/components/layouts/Providers";
import { getConsentDefaultScript } from "@/utils/consent.util";
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
        <script
          dangerouslySetInnerHTML={{ __html: getConsentDefaultScript() }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
