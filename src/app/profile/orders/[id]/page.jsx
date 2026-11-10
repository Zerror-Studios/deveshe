/**
 * /profile/orders/[id] (kit PRD-002 FR-3.1; was `pages/profile/orders/[id].jsx`).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import OrderDetailView from "@/views/OrderDetailView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Your Order – DeVeSheDreams",
  description: "Order status, tracking, cancellation and returns.",
  robots: "noindex, nofollow",
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  return toMetadata(META, `/profile/orders/${encodeURIComponent(id)}`);
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <>
      <PageSchemas
        meta={META}
        path={`/profile/orders/${encodeURIComponent(id)}`}
      />
      <OrderDetailView orderId={typeof id === "string" ? id : ""} />
    </>
  );
}
