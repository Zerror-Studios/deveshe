import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";
import OrderDetail from "@/components/profileNew/order/OrderDetail";
import withAuth from "@/lib/withAuth";

// PRD-015 FR-20: one order's status, tracking, cancel and returns. The
// route sits under /profile, so `middleware.js` already asks for a session
// cookie; the data is per customer, so nothing is rendered on the server.
const META = {
  title: "Your Order – DeVeSheDreams",
  description: "Order status, tracking, cancellation and returns.",
  robots: "noindex, nofollow",
};

const OrderDetailPage = () => {
  const router = useRouter();
  const orderId = typeof router.query.id === "string" ? router.query.id : "";

  return (
    <>
      <SeoHeader meta={META} />
      <section id="profile_section">
        <div id="profile_container">
          <Link href="/profile" className="order_link_btn">
            Back to your account
          </Link>
          <OrderDetail orderId={orderId} />
        </div>
      </section>
    </>
  );
};

export default withAuth(OrderDetailPage);
