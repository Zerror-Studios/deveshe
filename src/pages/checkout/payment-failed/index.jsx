import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";

const PaymentFailed = ({ meta }) => {
  return (
    <>
      <SeoHeader meta={meta} />
      <div className="thank-cont">
        {/* <div className="tlc t-logo-check">
          <img src={"/check.gif"} fill loading="lazy" loop="false" />
        </div> */}

        <div className="trc">
          <div className="t-text">
            <h1>Payment Failed</h1>
            <p>
              Unfortunately, your payment could not be processed. Please try
              again to complete your order.
            </p>
            <a href="/">
              <p className="donation-success__btn">Go to home page</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;

export async function getServerSideProps() {
  const meta = {
    title: "Payment Failed | DeVeSheDreams",
    description:
      "Unfortunately, your payment with DeVeSheDreams could not be processed. Please try again or contact our support team for assistance.",
    keywords:
      "DeVeSheDreams payment failed, payment error, transaction failed, retry payment, payment issue, DeVeSheDreams checkout error, online shopping payment problem",
    author: "DeVeSheDreams",
    robots: "noindex,follow",
  };
  return { props: { meta } };
}
