/**
 * /orders/status/[token] — the order status page (backend PRD-041 FR-13,
 * FR-14, FR-17). The order emails link here, a guest lands here after
 * paying, and `/profile` links a customer's own orders here.
 *
 * Read on the server with the kit's `getOrderStatus` (never cached, the
 * shopper's IP sent for the per-IP limit). An unknown or rotated token is
 * a 404 with the store's contact (`not-found.jsx`). The token is the
 * credential: the page is never indexed and never sent on as a referrer
 * (the kit's proxy sets `X-Robots-Tag`, `no-store` and `no-referrer`; the
 * metadata says so too), and the canonical never carries it.
 */

import { notFound } from "next/navigation";
import { getOrderStatus } from "@zcom/storefront-kit/server";
import { getErrorKey } from "@zcom/storefront-kit/core";
import OrderStatusView from "@/views/OrderStatusView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Your order – DeVeSheDreams",
  description: "The status of your DeVeSheDreams order.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/orders/status`,
  og: {
    title: "Your order – DeVeSheDreams",
    description: "The status of your DeVeSheDreams order.",
  },
  twitter: {
    card: "summary",
    title: "Your order – DeVeSheDreams",
    description: "The status of your DeVeSheDreams order.",
  },
};

export const metadata = {
  ...toMetadata(META, "/orders/status"),
  referrer: "no-referrer",
};

// A shopper's link: read per request
export const dynamic = "force-dynamic";

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function Page({ params }) {
  const { token } = await params;
  let status = null;
  let errorKey = null;
  try {
    status = await getOrderStatus(typeof token === "string" ? token : "");
  } catch (error) {
    // Rate limit or an outage: say so, never a 404 for a good link
    errorKey = getErrorKey(error);
  }
  if (!status && !errorKey) notFound();
  return <OrderStatusView status={status} errorKey={errorKey} />;
}
