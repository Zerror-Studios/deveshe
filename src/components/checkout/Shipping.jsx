import React from "react";

// PRD-014 UX-03 / W0V-C-03: shipping is what the server charges. The
// checkout session's `pricing` is shown once the shopper presses
// "Continue to payment" (both checkout paths); a session holds stock, so
// it is never opened on its own (W0V2-02). Until then (or while it is
// calculated) the label says so, and only a cart with free shipping can
// say "Free".
const Shipping = ({ pricing, isPricing = false, isFreeShippingEnabled = false }) => {
  let label = "Calculated at payment";
  if (pricing) {
    label =
      pricing.isFreeShipping || !pricing.shipping
        ? "Free"
        : `${String.fromCharCode(8377)} ${pricing.shipping}`;
  } else if (isPricing) {
    label = "Calculating…";
  } else if (isFreeShippingEnabled) {
    label = "Free";
  }

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
