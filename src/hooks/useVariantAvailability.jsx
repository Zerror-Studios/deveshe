"use client";

/**
 * Fresh stock read for the PDP and the cart (PRD-020 FR-8, FR-12, D9) on
 * the kit's `useStockSignal` (kit PRD-002 FR-4.1): `getVariantAvailability`
 * for up to 50 ids, never cached; while it is pending or failed the last
 * good answer stays (empty at first), so callers fall back to the
 * server-rendered value and nothing is blocked. `refresh()` re-reads
 * (variant change on the PDP, cart drawer opened).
 *
 * Keep in sync with `storefronts/rare-element/src/hooks/useVariantAvailability.jsx`.
 */

import { useMemo } from "react";
import { useStockSignal } from "@zcom/storefront-kit/client";
import { toAvailabilityIds } from "@/utils/stock-signal.util";

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useVariantAvailability(ids, { skip = false } = {}) {
  // A stable array per id list: the kit re-reads when its ids change
  const idsKey = toAvailabilityIds(ids).join(",");
  const variantIds = useMemo(
    () => (idsKey ? idsKey.split(",") : []),
    [idsKey],
  );
  const { signals, refresh } = useStockSignal(variantIds, {
    skip: skip || variantIds.length === 0,
  });
  // The store's helpers take `{ [id]: signal }`
  const fresh = useMemo(() => Object.fromEntries(signals), [signals]);
  return { fresh, refresh };
}
