import React from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "@/lib/apolloClient";
import Layout from "@/components/layouts/Layout";
import SmoothScroller from "@/components/common/SmoothScroll";
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
import "@/styles/legal.css";
import "@/styles/loader.css";
export default function App({ Component, pageProps }) {
  const client = createApolloClient();
  return (
    <>
      <ApolloProvider client={client}>
        <Layout>
          <SmoothScroller />
          <Component {...pageProps} />
        </Layout>
      </ApolloProvider>
    </>
  );
}
