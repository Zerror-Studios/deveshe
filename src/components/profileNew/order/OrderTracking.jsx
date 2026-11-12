/**
 * Order tracking block (PRD-015 FR-20, FR-18)
 *
 * Courier, AWB, "Track shipment" (the server's https `trackingUrl`,
 * replacing the old hard-coded Shiprocket link) and the latest scans from
 * `shipment.tracking`. The status line is the order's `trackingStatus`
 * (ours, whatever the shipping provider; backend PRD-044) in the kit's
 * shopper wording. Nothing is shown before the shipment has an AWB.
 */

import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { getShipmentStatusLabel } from "@zcom/storefront-kit/core";
import {
  formatOrderDate,
  getSafeTrackingUrl,
  toTrackingScans,
} from "@/utils/order-detail.util";

const OrderTracking = ({ shipment, trackingStatus = null }) => {
  const trackingUrl = getSafeTrackingUrl(shipment?.trackingUrl);
  const scans = toTrackingScans(shipment?.tracking);
  if (!shipment?.awb && !trackingUrl && scans.length === 0) return null;
  const statusLabel = getShipmentStatusLabel(trackingStatus);

  return (
    <section className="detail_block order_detail_block" aria-labelledby="order_tracking_title">
      <div className="order_detail_column">
        <h4 id="order_tracking_title">Tracking</h4>
        {statusLabel && <p>{`Status: ${statusLabel}`}</p>}
        {shipment?.courier && <p>{`Courier: ${shipment.courier}`}</p>}
        {shipment?.awb && <p>{`AWB: ${shipment.awb}`}</p>}
        {trackingUrl && (
          <a
            id="common_black_btn"
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="track-btn"
          >
            Track shipment
            <span className="sr-only"> (opens in a new tab)</span>
            <FiArrowRight aria-hidden="true" />
          </a>
        )}
        {scans.length > 0 && (
          <ol className="order_detail_list">
            {scans.map((scan) => (
              <li key={scan.key}>
                <strong>{scan.label}</strong>
                {scan.location ? ` · ${scan.location}` : ""}
                {scan.date ? ` · ${formatOrderDate(scan.date)}` : ""}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};

export default OrderTracking;
