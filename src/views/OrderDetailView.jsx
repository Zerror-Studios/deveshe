"use client";

/**
 * One order (PRD-015 FR-20; was `pages/profile/orders/[id].jsx`): status,
 * tracking, cancel and returns. The route sits under /profile, so the
 * proxy already asks for a session cookie; the data is per customer, so
 * nothing is rendered on the server.
 */

import React from "react";
import Link from "next/link";
import OrderDetail from "@/components/profileNew/order/OrderDetail";
import withAuth from "@/lib/withAuth";

const OrderDetailPage = ({ orderId }) => {
  return (
    <section id="profile_section">
      <div id="profile_container">
        <Link href="/profile" className="order_link_btn">
          Back to your account
        </Link>
        <OrderDetail orderId={orderId} />
      </div>
    </section>
  );
};

export default withAuth(OrderDetailPage);
