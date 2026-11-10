/**
 * Server reads through the kit's `zcomFetch` (kit PRD-002 FR-4.1): the
 * absolute gateway URL with the signed edge headers (the server-only
 * `EDGE_SHARED_SECRET` never reaches the browser), and errors that throw
 * unless they are `NOT_FOUND` (then the field reads null and the page can
 * 404). Anonymous only: no shopper token or cookie is sent from here.
 *
 * Never cached (`revalidate: false`): the data pages render per request,
 * as their `getServerSideProps` did. The store's own documents (`@/graphql`)
 * keep their field selections, which the views read.
 */

import { zcomFetch } from "@zcom/storefront-kit/server";

/** Runs one query; resolves its `data`. `options` as for kit `zcomFetch`. */
export async function serverQuery(query, variables, options = {}) {
  return await zcomFetch(query, variables, { revalidate: false, ...options });
}

/**
 * The `query({ query, variables })` shape the page loaders use (Apollo's,
 * so their code stays as it was); resolves `{ data }`.
 */
export const createServerQueryClient = (options = {}) => ({
  query: async ({ query, variables }) => ({
    data: await serverQuery(query, variables, options),
  }),
});
