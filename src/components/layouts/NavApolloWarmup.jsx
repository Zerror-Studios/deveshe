"use client";

import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { GET_CLIENT_SIDE_CATEGORIES, GET_LOOKBOOKS } from "@/graphql";
import { ProductStatus } from "@/utils/Constant";

/**
 * Primes the Apollo cache for nav dropdowns once per session so Navbar useQuery
 * usually hits cache (same client instance from Providers useMemo).
 */
export default function NavApolloWarmup() {
  const client = useApolloClient();

  useEffect(() => {
    const cacheFirst = { fetchPolicy: "cache-first", nextFetchPolicy: "cache-first" };
    client.query({
      query: GET_CLIENT_SIDE_CATEGORIES,
      variables: { offset: 0, limit: 100 },
      ...cacheFirst,
    });
    client.query({
      query: GET_LOOKBOOKS,
      variables: {
        offset: 0,
        limit: 100,
        filter: { status: ProductStatus.PUBLISHED },
      },
      ...cacheFirst,
    });
  }, [client]);

  return null;
}
