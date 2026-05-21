import React from "react";
import Script from "next/script";
import Providers from "./providers";

import "@/styles/globals.css";
import "@/styles/home.css";
import "@/styles/checkout.css";
import "@/styles/checkout2.css";
import "@/styles/address.css";
import "@/styles/productLoader.css";
import "swiper/css";
import "swiper/css/pagination";

import "@/styles/components/sizeAssistance.css";
import "@/styles/components/common/navbar.css";
import "@/styles/components/login.css";
import "@/styles/components/home.css";
import "@/styles/components/about.css";
import "@/styles/components/legal.css";
import "@/styles/components/lookBook.css";
import "@/styles/components/contact.css";
import "@/styles/components/cart.css";
import "@/styles/components/success.css";
import "@/styles/components/newPorfile.css";
import "@/styles/components/common/polaroid.css";
import "@/styles/components/common/productCard.css";
import "@/styles/components/common/blog-card.css";
import "@/styles/components/blogs/blogs-listing.css";
import "@/styles/components/blogs/blog-post.css";
import "@/styles/components/common/footer.css";
import "@/styles/components/common/bracket-slide-cta.css";
import "@/styles/components/home/curated-products.css";
import "@/styles/components/home/category-explore.css";
import "@/styles/components/home/featured-article.css";
import "@/styles/components/shop/hero-section.css";
import "@/styles/components/fonts.css";
import "@/styles/components/site-gate.css";

export const metadata = {
  title: "DeVeSheDreams",
  description:
    "DeVeSheDreams is a fashion label that turns dreams into wearable art.",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z10KLGLTDB"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z10KLGLTDB');
          `}
        </Script>
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W56B2J8G');
          `}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W56B2J8G"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
