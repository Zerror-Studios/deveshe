import React from "react";

const Heading = ({ totalCount = 0 }) => {
  return (
    <div className="pay-top" style={{ marginInline: "-2vw", width: "100%" }}>
      <div className="pay-head">
        <h4>Order History ({totalCount})</h4>
        <p>
          Access your order history effortlessly to track past purchases and
          manage returns
        </p>
        <p>Your information is kept safe and secure with us</p>
      </div>
    </div>
  );
};

export default Heading;
