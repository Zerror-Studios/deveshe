import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch"; // Needed for Node.js

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
      fetch,
      headers: {
        dbtoken: `Bearer ${process.env.NEXT_PUBLIC_DB_TOKEN}`
      },
    }),
    cache: new InMemoryCache(),
  });
}
