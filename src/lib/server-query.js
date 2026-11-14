/**
 * Server reads through the kit's `zcomFetch` (kit PRD-002 FR-4.1): the
 * absolute gateway URL with the signed edge headers (the server-only
 * `EDGE_SHARED_SECRET` never reaches the browser), and errors that throw
 * unless they are `NOT_FOUND` (then the field reads null and the page can
 * 404). Anonymous only: no shopper token or cookie is sent from here.
 *
 * The catalog pages are ISR (`export const revalidate = STORE_REVALIDATE_SECONDS`,
 * like Nahara's, 2026-11-14): `revalidate` here is the page interval, and the
 * kit reads the gateway afresh on every rebuild (kit 1.2.2). A call with a
 * shopper's IP (`clientIp`, payment links) is never cached and keeps its
 * page dynamic.
 */

import { zcomFetch } from "@zcom/storefront-kit/server";

/** The catalog pages rebuild every 5 minutes (`export const revalidate`). */
export const STORE_REVALIDATE_SECONDS = 300;

/** Runs one query; resolves its `data`. `options` as for kit `zcomFetch`. */
export async function serverQuery(query, variables, options = {}) {
  return await zcomFetch(query, variables, {
    revalidate: STORE_REVALIDATE_SECONDS,
    ...options,
  });
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
