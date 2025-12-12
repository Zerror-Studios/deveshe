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
    title: "Payment Failed – DeVeSheDreams",
    description:
      "Unfortunately, your payment could not be processed. Please try again or contact DeVeSheDreams support for assistance.",
    keywords: [
      "DeVeSheDreams payment failed",
      "payment error",
      "transaction failed",
      "checkout issue",
      "order payment problem"
    ],
    primaryKeywords: ["DeVeSheDreams payment failed", "payment error"],
    author: "DeVeSheDreams",
    robots: "noindex, nofollow",
    og: {
      title: "Payment Failed – DeVeSheDreams",
      description:
        "Your payment could not be processed. Please try again or reach out to DeVeSheDreams support for help with your order."
    },
    twitter: {
      card: "summary_large_image",
      title: "Payment Failed – DeVeSheDreams",
      description:
        "Payment unsuccessful! Contact DeVeSheDreams support or try again to complete your order."
    }
  };

  return { props: { meta } };
}
