import React, { useEffect, useState } from "react";
import Layout from "@/components/layouts/Layout";
import SmoothScroller from "@/components/common/SmoothScroller";
import { ToastContainer } from "react-toastify";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "@/lib/apolloClient";
import { AuthProvider } from "@/context/AuthContext";
import { TokenManager } from "@/utils/tokenManager";
import { startVisitAttribution } from "@/utils/ga-attribution.util";
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

export default function App({ Component, pageProps }) {
  // One client per browser session (SF-19); server pages create their own.
  const [client] = useState(() => createApolloClient());

  useEffect(() => {
    TokenManager.clearLegacyStorage();
    // PRD-012: remember the visit's UTMs, referrer and landing page once
    // (only with analytics consent, W1V-C-03)
    return startVisitAttribution();
  }, []);

  return (
    <>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Layout>
            <SmoothScroller />
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
        <ToastContainer position="top-right" />
      </ApolloProvider>
    </>
  );
}
