/**
 * The order status page body (backend PRD-041 FR-13, §7), rendered on the
 * server from the kit's `getOrderStatus`: the heading ("Thank you, Priya!
 * Order #DD1042 is confirmed" once paid), the timeline (Confirmed →
 * Shipped with the courier, AWB and tracking link → Delivered; or
 * Cancelled), the items, the totals, the delivery address (street masked by
 * the server), the payment status and the store's contact. Nothing here
 * comes from the browser; the sign-in hint is the only client part.
 */

import React from "react";
import Image from "next/image";
import { formatMoney } from "@zcom/storefront-kit/core";
import CommonButton from "@/components/common/CommonButton";
import OrderStatusSignIn from "@/components/orderStatus/OrderStatusSignIn";
import { getKitKeyMessage } from "@/utils/api-error.util";
import {
  formatOrderDate,
  getSafeTrackingUrl,
} from "@/utils/order-detail.util";
import {
  formatOrderNumber,
  getOrderTimeline,
  getPaymentStatusLabel,
  getStatusHeading,
} from "@/utils/guest-checkout.util";

// ─── Constants ────────────────────────────────────────────────────────────

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "deveshedreams@gmail.com";

// ─── Parts ────────────────────────────────────────────────────────────────

const Timeline = ({ status }) => {
  const steps = getOrderTimeline(status);
  const shipment = status.shipment;
  const trackingUrl = getSafeTrackingUrl(shipment?.trackingUrl);
  return (
    <ol className="order_status_timeline" aria-label="Order progress">
      {steps.map((step) => (
        <li
          key={step.key}
          className={[
            "order_status_step",
            step.done ? "is-done" : "",
            step.current ? "is-current" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-current={step.current ? "step" : undefined}
        >
          <span className="order_status_dot" aria-hidden="true" />
          <div>
            <p className="order_status_step_label">
              {step.label}
              <span className="sr-only">{step.done ? " (done)" : " (to come)"}</span>
            </p>
            {step.key === "SHIPPED" && step.done && shipment && (
              <p className="order_status_muted">
                {[shipment.courierName, shipment.awbCode && `AWB ${shipment.awbCode}`]
                  .filter(Boolean)
                  .join(" · ")}
                {trackingUrl && (
                  <>
                    {" "}
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                      Track your parcel
                    </a>
                  </>
                )}
              </p>
            )}
            {step.key === "DELIVERED" && shipment?.deliveredAt && (
              <p className="order_status_muted">
                {formatOrderDate(shipment.deliveredAt)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

const Totals = ({ status }) => {
  const money = (amount) => formatMoney(amount, status.currency);
  const rows = [
    { label: "Subtotal", value: money(status.subtotal) },
    status.discount > 0 && { label: "Discount", value: `- ${money(status.discount)}` },
    {
      label: "Shipping",
      value: status.shipping > 0 ? money(status.shipping) : "Free",
    },
    status.tax > 0 && {
      label: status.pricesIncludeTax ? "Tax (included)" : "Tax",
      value: money(status.tax),
    },
  ].filter(Boolean);
  return (
    <dl className="order_status_totals">
      {rows.map((row) => (
        <div key={row.label} className="order_status_row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
      <div className="order_status_row order_status_total">
        <dt>Total</dt>
        <dd>{money(status.total)}</dd>
      </div>
    </dl>
  );
};

// ─── View ─────────────────────────────────────────────────────────────────

const OrderStatusView = ({ status, errorKey = null }) => {
  if (!status) {
    return (
      <div id="status_section" role="alert">
        <h2>
          We couldn&rsquo;t load <br /> your <span>order</span>
        </h2>
        <p>{getKitKeyMessage(errorKey || "UNKNOWN")}</p>
        <p>
          Contact us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <CommonButton title={"Go Back to Home"} href={"/"} type="button" />
      </div>
    );
  }

  const address = status.shippingAddress;
  const store = status.store || {};
  const storeEmail = store.email || SUPPORT_EMAIL;

  return (
    <section id="order_status_section">
      <div className="order_status_card">
        <p className="order_status_kicker">
          {[formatOrderNumber(status.orderNo), formatOrderDate(status.placedAt)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h1>{getStatusHeading(status)}</h1>

        <Timeline status={status} />

        <section aria-labelledby="order_status_items">
          <h2 id="order_status_items">Items</h2>
          <ul className="order_status_lines">
            {status.lines.map((line, index) => (
              <li key={`line-${index}`} className="order_status_line">
                {line.imagePath ? (
                  <Image
                    className="order_status_image"
                    width={160}
                    height={200}
                    src={line.imagePath}
                    alt={line.name}
                  />
                ) : (
                  <span className="order_status_image" aria-hidden="true" />
                )}
                <div className="order_status_line_text">
                  <p>{line.name}</p>
                  <p className="order_status_muted">{`Qty ${line.quantity}`}</p>
                </div>
                <p>{formatMoney(line.unitPrice * line.quantity, status.currency)}</p>
              </li>
            ))}
          </ul>
          <Totals status={status} />
        </section>

        <div className="order_status_grid">
          {address && (
            <section aria-labelledby="order_status_address">
              <h2 id="order_status_address">Delivery address</h2>
              {address.name && <p>{address.name}</p>}
              {address.line && <p>{address.line}</p>}
              <p>
                {[address.city, address.state, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </section>
          )}
          <section aria-labelledby="order_status_payment">
            <h2 id="order_status_payment">Payment</h2>
            <p>{getPaymentStatusLabel(status.paymentStatus) || "—"}</p>
          </section>
          <section aria-labelledby="order_status_help">
            <h2 id="order_status_help">Need help?</h2>
            {store.name && <p>{store.name}</p>}
            <p>
              <a href={`mailto:${storeEmail}`}>{storeEmail}</a>
            </p>
            {store.phone && (
              <p>
                <a href={`tel:${store.phone.replace(/[^\d+]/g, "")}`}>{store.phone}</a>
              </p>
            )}
          </section>
        </div>

        <OrderStatusSignIn />
        <CommonButton title={"Continue shopping"} href={"/shop"} type="button" />
      </div>
    </section>
  );
};

export default OrderStatusView;
