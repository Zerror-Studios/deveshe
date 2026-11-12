import React from "react";
import { getShippingLabel } from "@/utils/shipping-label.util";

// PRD-014 UX-03 / W0V-C-03: shipping is what the server charges. The
// checkout session's `pricing` is shown once the shopper presses
// "Continue to payment" (both checkout paths); a session holds stock, so
// it is never opened on its own (W0V2-02). Before that, the server's
// estimate for the address entered (`shippingEstimate`, 2026-11-13).
const Shipping = ({
  pricing,
  isPricing = false,
  isFreeShippingEnabled = false,
  estimate = null,
  estimating = false,
}) => {
  const label = getShippingLabel({ pricing, isPricing, estimate, estimating, isFreeShippingEnabled });

  return (
    <div className="Shipping_container">
      <div className="Shipping_title_cntr">
        <h2 className="same_style_text">Shipping method</h2>
      </div>
      <div className="Shipping_method_cntr">
        <p aria-live="polite">{label}</p>
      </div>
    </div>
  );
};

export default Shipping;
