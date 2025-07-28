import React from "react";

const Shipping = () => {
  return (
    <div className="Shipping_container">
      <div className="Shipping_title_cntr">
        <h2 className="same_style_text">Shipping method</h2>
      </div>
      {/* {Object.keys(details) != 0 ? (
        <div className="Shipping_method_cntr">
          <p>Enter your shipping address</p>
        </div>
      ) : ( */}
      
      <div className="Shipping_method_cntr">
        <p>Free</p>
      </div>
      {/* )} */}
    </div>
  );
};

export default Shipping;
