/**
 * /delivery/update (backend PRD-051 FR-12): the "Change address" link of
 * the delivery-failed WhatsApp and email. Never indexed; the canonical is
 * fixed, so the link's token never reaches it.
 */

import DeliveryUpdateView from "@/views/DeliveryUpdateView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Update your delivery – DeVeSheDreams",
  description: "Change the address, phone or day for your DeVeSheDreams delivery.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
};

export const metadata = toMetadata(META, "/delivery/update");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return <DeliveryUpdateView />;
}
