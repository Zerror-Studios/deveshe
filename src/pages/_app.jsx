import React from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/layouts/Layout";
import SmoothScroller from "@/components/common/SmoothScroller";
import "@/styles/globals.css";
import "@/styles/home.css";
import "@/styles/login.css";
import "@/styles/checkout.css";
import "@/styles/checkout2.css";
import "@/styles/success.css";
import "@/styles/address.css";
import "@/styles/cartModal.css";
import "@/styles/navbar.css";
import "@/styles/profile.css";
import "@/styles/productLoader.css";
import "@/styles/collectionLoader.css";
import "@/styles/lookBook.css";

import "@/styles/components/home.css";
import "@/styles/components/loader.css";
import "@/styles/components/legal.css";
import "@/styles/components/common/polaroid.css";

export default function App({ Component, pageProps }) {
  const client = createApolloClient();
  return (
    <>
      <ApolloProvider client={client}>
        <Layout>
          <SmoothScroller />
          <Component {...pageProps} />
        </Layout>
        <Toaster position="top-right" reverseOrder={false} />
      </ApolloProvider>
    </>
  );
}
