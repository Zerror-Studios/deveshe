/**
 * Apollo client for server code — SERVER ONLY (kit PRD-002 FR-3.1).
 *
 * Server pages, route handlers and `lib/page-data/*.server.js` read the
 * catalog anonymously through `${API_GATEWAY_URL}/v1/graphql` with the
 * tenant headers (`lib/api-config.util.js`) and the edge headers they pass
 * in (`lib/edge-headers.server.js`). It has none of the browser client's
 * links (token, refresh, toasts): those never ran on the server, and the
 * App Router keeps browser code out of server files. A new client per
 * call, so nothing is cached between requests.
 */

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { getGraphqlUri, getTenantHeaders } from "@/lib/api-config.util";

/** `headers`: the edge headers (and the shopper's IP, where needed). */
export function createServerApolloClient({ headers = {} } = {}) {
  return new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: getGraphqlUri(),
      headers: { ...getTenantHeaders(), ...headers },
    }),
    cache: new InMemoryCache(),
  });
}
