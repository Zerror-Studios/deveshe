"use client";

/**
 * "Sign in with your email to see all your orders in one place" on the
 * order status page (backend PRD-041 §7), only for a shopper who isn't
 * signed in (the kit's session). A signed-in customer gets a link to their
 * orders instead.
 */

import React from "react";
import Link from "next/link";
import { useSession } from "@zcom/storefront-kit/client";
import { getLoginPath } from "@/utils/redirect.util";

const OrderStatusSignIn = () => {
  const { status } = useSession();
  if (status === "unknown") return null;
  if (status === "customer") {
    return (
      <p className="order_status_signin">
        <Link href="/profile">See all your orders</Link>
      </p>
    );
  }
  return (
    <p className="order_status_signin">
      <Link href={getLoginPath("/profile")}>Sign in with your email</Link> to
      see all your orders in one place.
    </p>
  );
};

export default OrderStatusSignIn;
