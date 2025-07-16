import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Create HTTP link to your GraphQL API endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
});

// Middleware to attach auth headers
const authLink = setContext((_, { headers }) => {
  // Read tokens safely only on the client
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const dbToken = process.env.NEXT_PUBLIC_DB_TOKEN;

  return {
    headers: {
      ...headers,
      authtoken: token ? `Bearer ${token}` : "",
      dbtoken: dbToken ? `Bearer ${dbToken}` : "",
    },
  };
});

// Apollo Client instance
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development",
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default apolloClient;
