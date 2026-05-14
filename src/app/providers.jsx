"use client";

import React, { Suspense, useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { ToastContainer } from "react-toastify";
import { createApolloClient } from "@/lib/apolloClient";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layouts/Layout";
import NavApolloWarmup from "@/components/layouts/NavApolloWarmup";
import SmoothScroller from "@/components/common/SmoothScroller";

export default function Providers({ children }) {
  const client = useMemo(() => createApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <NavApolloWarmup />
      <AuthProvider>
        <Layout>
          <Suspense fallback={null}>
            <SmoothScroller />
          </Suspense>
          {children}
        </Layout>
      </AuthProvider>
      <ToastContainer position="top-right" />
    </ApolloProvider>
  );
}

