"use client";

/**
 * Primes the Apollo cache with the nav's lookbook list once per session, so
 * the desktop and mobile navs' `useQuery` usually reads it from the cache
 * (the kit's one Apollo client, `ZcomSsrProvider`). The variables must match
 * the navs' exactly.
 */

import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { GET_NAV_LOOKBOOKS } from "@/graphql";

// ─── Constants ────────────────────────────────────────────────────────────

const NAV_LOOKBOOK_LIMIT = 50;

// ─── Component ────────────────────────────────────────────────────────────

export default function NavApolloWarmup() {
  const client = useApolloClient();

  useEffect(() => {
    // A failed warm-up is harmless: the navs ask again themselves.
    client
      .query({
        query: GET_NAV_LOOKBOOKS,
        variables: { limit: NAV_LOOKBOOK_LIMIT },
        fetchPolicy: "cache-first",
      })
      .catch(() => {});
  }, [client]);

  return null;
}
