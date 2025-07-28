import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import fetch from "cross-fetch";

// Define the static GraphQL HTTP link
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
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
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
