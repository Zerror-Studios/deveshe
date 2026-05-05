import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

/**
 * Server-only Apollo client for App Router data fetching.
 * - No browser-only auth/token refresh logic.
 * - Always attaches the dbtoken header used by the API.
 */
export function createApolloClientServer() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
    fetchOptions: { cache: "no-store" },
  });

  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        dbtoken: `Bearer ${process.env.NEXT_PUBLIC_DB_TOKEN}`,
      },
    }));

    return forward(operation);
  });

  return new ApolloClient({
    ssrMode: true,
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache({ addTypename: true }),
  });
}

