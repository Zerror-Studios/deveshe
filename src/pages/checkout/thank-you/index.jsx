import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SeoHeader from "@/components/seo/SeoHeader";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";

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
      <div id="status_section">
        <Image
          width={1000}
          height={1000}
          src="/success.gif"
          alt="payment successfull"
        />
        <h2>
          Thank You <br /> for Your <span>Purchase!</span>
        </h2>
        <p>
          Your payment has been successfully processed. We’re preparing your
          order and will send you updates soon. Thank you for shopping.
        </p>
        <p>
          You will be redirected to the home page in<strong> {time} </strong>
          seconds
        </p>
        <CommonButton title={"Go Back to Home"} href={"/"} />
      </div>
    </>
  );
};

export default ThankYou;

export async function getServerSideProps() {
  const meta = {
    title: "Thank You for Your Order – DeVeSheDreams",
    description:
      "Thank you for your order! Your DeVeSheDreams purchase has been successfully placed. We’ll notify you with shipping details and updates.",
    keywords: [
      "DeVeSheDreams order confirmation",
      "order received",
      "thank you for your order",
      "purchase confirmation",
      "order success"
    ],
    primaryKeywords: ["DeVeSheDreams order confirmation", "order received"],
    author: "DeVeSheDreams",
    robots: "noindex, nofollow",
    og: {
      title: "Thank You for Your Order – DeVeSheDreams",
      description:
        "Your order has been successfully placed at DeVeSheDreams. Thank you for shopping with us! We’ll keep you updated on your order status."
    },
    twitter: {
      card: "summary_large_image",
      title: "Thank You for Your Order – DeVeSheDreams",
      description:
        "Order received! DeVeSheDreams will send you updates on your order status and shipping details."
    }
  };

  return { props: { meta } };
}
