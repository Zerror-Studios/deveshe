import Router from "next/router";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { useAuthStore } from "@/store/auth-store";
import { AuthCookies } from "@/utils/AuthCookies";

// -------------------------------------------
// UNAUTHENTICATED handler
// -------------------------------------------
const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    useAuthStore.getState().clearAuth();
    AuthCookies.remove();
    localStorage.removeItem("user-data");
    Router.replace("/login");
  }
};

// -------------------------------------------
// ERROR MIDDLEWARE (replaces deprecated onError())
// -------------------------------------------
const errorLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const { graphQLErrors } = response ?? {};

    if (graphQLErrors) {
      graphQLErrors.forEach((err) => {
        const code = err.extensions?.code;
        if (code === "UNAUTHENTICATED" || code === "TOKEN_EXPIRED" || err.extensions?.exception?.name === "TokenExpiredError") {
          handleUnauthorized();
        }
      });
    }

    return response;
  });
});

// -------------------------------------------
// AUTH MIDDLEWARE (replaces deprecated setContext())
// -------------------------------------------
const authLink = new ApolloLink((operation, forward) => {
  // let token = null;

  // if (typeof window !== "undefined") {
  //   try {
  //     const stored = localStorage.getItem("user-auth");
  //     token = stored ? JSON.parse(stored)?.state?.token : null;
  //   } catch (_) { }
  // }
  const token = AuthCookies.get();
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      dbtoken: `Bearer ${process.env.NEXT_PUBLIC_DB_TOKEN}`,
      ...(token ? { authtoken: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

// -------------------------------------------
// HTTP LINK
// -------------------------------------------
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  credentials: "same-origin",
});

// -------------------------------------------
// FINAL APOLLO CLIENT (NO deprecated APIs)
// -------------------------------------------
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([authLink, httpLink, errorLink]),
    cache: new InMemoryCache(),
  });
}
