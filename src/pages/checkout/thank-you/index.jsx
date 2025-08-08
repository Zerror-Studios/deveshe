import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";

const ThankYou = ({ meta }) => {
  const router = useRouter();
  const [time, setTime] = useState(10);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [router]);

  return (
    <>
      <SeoHeader meta={meta} />
      <div className="thank-cont">
        <div className="tlc t-logo-check">
          <img src={"/check.gif"} alt="Success" loading="lazy" />
        </div>

        <div className="trc">
          <div className="t-text">
            <h1>Thank You for Your Purchase!</h1>
            <p>
              Your payment has been successfully processed. We’re preparing your
              order and will send you updates soon. Thank you for shopping.
            </p>
            <p>
              You will be redirected to the home page in <strong>{time}</strong>{" "}
              seconds
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

export default ThankYou;

export async function getServerSideProps() {
  const meta = {
    title: "Thank You for Your Order | DeVeSheDreams",
    description:
      "Your order with DeVeSheDreams has been placed successfully. We will send you a confirmation email with all the details shortly. Thank you for shopping with us!",
    keywords:
      "DeVeSheDreams order confirmation, thank you page, order placed successfully, online shopping India, designer wear, luxury fashion, order success, DeVeSheDreams shopping",
    author: "DeVeSheDreams",
    robots: "noindex,follow",
  };
  return { props: { meta } };
}
