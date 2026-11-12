/**
 * An unknown, mistyped or replaced order status link (backend PRD-041
 * §7): a 404 that points the shopper at the store, never at anyone's order.
 */

import React from "react";
import CommonButton from "@/components/common/CommonButton";

// ─── Constants ────────────────────────────────────────────────────────────

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "deveshedreams@gmail.com";

export const metadata = {
  title: "Order not found – DeVeSheDreams",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// ─── Page ─────────────────────────────────────────────────────────────────

export default function OrderStatusNotFound() {
  return (
    <div id="status_section">
      <h2>
        We couldn&rsquo;t find <br /> this <span>order</span>
      </h2>
      <p>
        This order link isn&rsquo;t valid any more. Check the latest email
        about your order, or contact us and we&rsquo;ll help.
      </p>
      <p>
        Contact us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <CommonButton title={"Contact us"} href={"/contact"} type="button" />
    </div>
  );
}
