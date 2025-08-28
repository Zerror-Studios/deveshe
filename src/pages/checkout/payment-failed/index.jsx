import React from "react";
import SeoHeader from "@/components/seo/SeoHeader";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";

const PaymentFailed = ({ meta }) => {
  return (
    <>
      <SeoHeader meta={meta} />

      <div id="status_section">
        <Image
          width={1000}
          height={1000}
          src="/fail.gif"
          className="fail_gif"
          alt="payment failed"
        />
        <h2>
          Payment <span>Failed</span>
        </h2>
        <p>
          Unfortunately, your payment could not be processed. Please try again
          to complete your order.
        </p>
        <CommonButton title={"Go Back to Home"} href={"/"} />
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
