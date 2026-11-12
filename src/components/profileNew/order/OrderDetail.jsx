/**
 * Order detail (PRD-015 FR-20)
 *
 * One order of the signed-in customer: the server's `displayStatus`,
 * tracking, Cancel (only when `canCancel`), returns and the lines. Loading,
 * error (with retry) and not-found states; the server answers NOT_FOUND
 * for another customer's order.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { useMyOrderStatusToken } from "@zcom/storefront-kit/client";
import { orderStatusPath } from "@zcom/storefront-kit/core";
import { GET_ORDER_DETAIL } from "@/graphql";
import { formatDateTime, formatePrice } from "@/utils/Util";
import { getErrorCode } from "@/utils/api-error.util";
import { formatOrderDate, getOrderStatusLabel } from "@/utils/order-detail.util";
import OrderTracking from "./OrderTracking";
import OrderCancel from "./OrderCancel";
import OrderReturns from "./OrderReturns";

const PAYMENT_LABELS = { PAID: "Paid", UN_PAID: "Unpaid" };

const OrderDetail = ({ orderId }) => {
  const { data, loading, error, refetch } = useQuery(GET_ORDER_DETAIL, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: "network-only",
  });
  const order = data?.myOrder;
  // PRD-041 FR-14: the same order status page the emails link to
  const statusPath = orderStatusPath(useMyOrderStatusToken(order?._id ?? null));

  const refresh = async () => {
    await refetch();
  };

  if (loading && !order) {
    return (
      <div className="no-order-div flex-all" role="status">
        <div className="loader-btn" />
        <span className="sr-only">Loading order…</span>
      </div>
    );
  }
  if (error && !order && getErrorCode(error) !== "NOT_FOUND") {
    return (
      <div className="detail_block order_detail_block" role="alert">
        <p>We couldn't load this order. Please try again.</p>
        <button type="button" className="btn-cancel" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="detail_block order_detail_block">
        <p className="no-data">Order not found.</p>
      </div>
    );
  }

  const statusLabel = getOrderStatusLabel(
    order.displayStatus,
    PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus || "",
  );
  const address = order.shippingAddress;

  return (
    <>
      <div id="profile_header_inside" className="detail_block">
        <div className="profile_left_container">
          <h4>{`Order ${order.orderNo || ""}`}</h4>
          <p>{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="order_detail_column">
          <span className="status order_status">{statusLabel}</span>
          {order.displayStatus === "CANCELLED" && order.cancelReason && (
            <p>{order.cancelReason}</p>
          )}
          {order.deliveredAt && (
            <p>{`Delivered ${formatOrderDate(order.deliveredAt)}`}</p>
          )}
          {statusPath && (
            <Link href={statusPath} className="order_link_btn">
              View order status
            </Link>
          )}
        </div>
      </div>

      <OrderTracking shipment={order.shipment} trackingStatus={order.trackingStatus} />

      {order.canCancel && (
        <OrderCancel orderId={order._id} onChanged={refresh} />
      )}

      <OrderReturns
        orderId={order._id}
        returnableItems={order.returnableItems || []}
        returnableUntil={order.returnableUntil}
        returnRequests={order.returnRequests || []}
        onChanged={refresh}
      />

      <section className="detail_block order_detail_block" aria-labelledby="order_items_title">
        <div className="order_detail_column">
          <h4 id="order_items_title">Items</h4>
          <ul className="order_detail_list">
            {(order.cart || []).map((item, index) => (
              <li key={item.id || `order-line-${index}`} className="product-cell">
                <Image
                  className="skeleton-loading"
                  width={1000}
                  height={1000}
                  src={item?.asset?.path || ""}
                  alt={item?.asset?.altText || item?.name || ""}
                />
                <div>
                  <p className="product-name">{item?.name || ""}</p>
                  <p>{`Qty : ${item?.qty || ""}`}</p>
                  <p>{formatePrice(item?.finalPrice || 0)}</p>
                  {/* PRD-032 FR-D4: delivered items can be reviewed */}
                  {order.displayStatus === "DELIVERED" && item?.productId && (
                    <Link href="/profile?tab=reviews" className="order_link_btn">
                      Review
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p>{`Total: ${formatePrice(order.orderPrice ?? order.discountedPrice ?? 0)}`}</p>
          {address && (
            <p>
              {`Ship to: ${[address.firstname, address.lastname].filter(Boolean).join(" ")}, ${[
                address.addressline1,
                address.addressline2,
                address.city,
                address.states,
                address.pincode,
              ]
                .filter(Boolean)
                .join(", ")}`}
            </p>
          )}
          {order.invoiceUrl && (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="order_link_btn"
            >
              Download invoice
            </a>
          )}
        </div>
      </section>
    </>
  );
};

export default OrderDetail;
