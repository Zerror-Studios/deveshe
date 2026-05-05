"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import CommonButton from "@/components/common/CommonButton";
import { useQuery } from "@apollo/client/react";
import { GET_ORDER_BY_ID } from "@/graphql";
import { trackEcomEvent } from "@/utils/analytics";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThankYouClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [time, setTime] = useState(10);

  const { data: orderData } = useQuery(GET_ORDER_BY_ID, {
    variables: { getClientSidePaymentByOrderIdId: id },
    skip: !id,
  });

  useEffect(() => {
    if (orderData?.getClientSidePaymentByOrderId) {
      const orderInfo = orderData.getClientSidePaymentByOrderId;
      const order = orderInfo.order;
      trackEcomEvent.purchase(
        order._id,
        order.totalprice,
        order.cart || [],
        order.shippingAmount || 0,
        order.taxAmount || 0
      );
    }
  }, [orderData]);

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
        Your payment has been successfully processed. We’re preparing your order
        and will send you updates soon. Thank you for shopping.
      </p>
      <p>
        You will be redirected to the home page in<strong> {time} </strong>
        seconds
      </p>
      <CommonButton title={"Go Back to Home"} href={"/"} />
    </div>
  );
}

