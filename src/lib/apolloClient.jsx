import Router from "next/router";
import fetch from "cross-fetch";
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { useAuthStore } from "@/store/auth-store";

// UNAUTHENTICATED Verify
const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    useAuthStore.getState().clearAuth();
    localStorage.removeItem("token");
    localStorage.removeItem("user-auth");
    Router.replace("/login");
  }
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.extensions?.code === "UNAUTHENTICATED" || err.extensions.exception.name === "TokenExpiredError") {
        handleUnauthorized();
      }
    }
  }

  if (
    networkError?.statusCode === 401 ||
    networkError?.response?.status === 401
  ) {
    handleUnauthorized();
  }
});

// Define the static GraphQL HTTP link
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  credentials: "same-origin",
  fetch,
});

// Define the auth link to attach token conditionally
const authLink = setContext((_, { headers }) => {
  let token = null;
  if (typeof window !== "undefined") {
    try {
      const storedAuth = localStorage.getItem("user-auth");
      token = storedAuth ? JSON.parse(storedAuth)?.state?.token : null;
    } catch (err) {
      console.warn("Invalid auth token in localStorage", err);
    }
  }

  return {
    headers: {
      ...headers,
      dbtoken: `Bearer ${process.env.NEXT_PUBLIC_DB_TOKEN}`,
      ...(token && { authtoken: `Bearer ${token}` }),
    },
  };
});

// Apollo Client factory
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
