import React from "react";

const OrderSummery = ({ cartData, setCartData }) => {
  const {
    totalprice = 0,
    itemcount = 0,
    isFreeShippingEnabled = false,
    discountedPrice = 0,
    cart = [],
  } = cartData || {};
  const renderVariants = (variant) =>
    variant.map((value, idx) => (
      <div key={idx} className="varients-cart">
        <div
          style={{
            position: "relative",
            display: "flex",
          }}
          className="cart_item_det"
        >
          <p className="cart-p">
            <span>{value}</span>
            {idx < variant.length - 1 && " /"}
          </p>
        </div>
      </div>
    ));
  return (
    <div className="final-checkout-cont">
      <div className="checkout-t">Order Summary ({itemcount})</div>

      <div className="checkout-items-cont">
        {cart &&
          cart?.map((item, index) => {
            const price = item?.variantDetail?.variantPrice || null;
            return (
              <div
                key={index}
                className="summary-cont"
                style={index < cart.length - 1 ? {} : { borderBottom: "none" }}
              >
                {!price ? (
                  //   <FinalpriceLoader2 />
                  <></>
                ) : (
                  <>
                    <div className="summary-price"> &#8377; {price}</div>
                  </>
                )}
                <div className="summary-img-cont">
                  <img
                    src={item?.asset?.path || ""}
                    alt={item?.asset?.altText || ""}
                    style={{ maxHeight: "100%" }}
                  />
                </div>
                <div className="summary-details">
                  <div className="summary-name">{item.name}</div>
                  {renderVariants(item?.variantDetail?.selectedOptions || [])}
                  <div style={{ fontSize: "12px" }}>
                    {" "}
                    Qty: {item?.qty || ""}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <div className={`promo-cont t3`}>
        <input
          type="text"
          className="promo-input"
          placeholder="Discount Code or Gift Card"
        />
        <button className="_btn_wrapper _btn_height _w-full ApplyBtn">
          Apply
        </button>
      </div>
      <div className="checkout-price-cont">
        <div className="cpp">
          Subtotal:
          {!totalprice ? (
            // <FinalpriceLoader2 />
            <></>
          ) : (
            <div className="cpp-p"> &#8377; {totalprice}</div>
          )}
        </div>
        <div className="cpp">
          Shipping:
          <div className="cpp-p">
            {isFreeShippingEnabled ? "Free" : `${String.fromCharCode(8377)} 0.0`}

          </div>
        </div>
        <div className="cpp">
          Taxes:
          <div className="cpp-p"> &#8377; {0.0}</div>
        </div>
      </div>
      <div className="checkout-total">
        Total:
        {!discountedPrice ? (
          //   <FinalpriceLoader2 />
          <></>
        ) : (
          <div className="checkout-price">&#8377; {discountedPrice}</div>
        )}
      </div>
    </div>
  );
};

export default OrderSummery;
