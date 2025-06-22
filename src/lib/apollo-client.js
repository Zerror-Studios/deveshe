import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Create HTTP link to your GraphQL endpoint
const httpLink = createHttpLink({
	uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
});

// Create auth link for adding authorization headers if needed
const authLink = setContext((_, { headers }) => {
	// Get the authentication token from local storage if it exists
	const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

	// Get the database token from environment variables
	const dbToken = process.env.NEXT_PUBLIC_DB_TOKEN;

	// Return the headers to the context so httpLink can read them
	return {
		headers: {
			...headers,
			authtoken: token ? `Bearer ${token}` : "",
			dbtoken: dbToken ? `Bearer ${dbToken}` : "",
		},
	};
});

// Create Apollo Client instance
const apolloClient = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache({
		// Configure cache policies if needed
		typePolicies: {
			// Example: Configure how certain types should be cached
			// Product: {
			//   fields: {
			//     reviews: {
			//       merge(existing = [], incoming) {
			//         return [...existing, ...incoming];
			//       },
			//     },
			//   },
			// },
		},
	}),
	// Enable dev tools in development
	connectToDevTools: process.env.NODE_ENV === "development",
	// Default options for queries
	defaultOptions: {
		watchQuery: {
			errorPolicy: "all",
		},
		query: {
			errorPolicy: "all",
		},
	},
});

export default apolloClient;
