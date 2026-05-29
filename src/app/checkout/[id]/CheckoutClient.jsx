"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutSchema } from "@/validations/CheckoutValidation";
import { useMutation, useQuery } from "@apollo/client/react";
import { CART_LIST, CHECKOUT_ORDER } from "@/graphql";
import Heading from "@/components/checkout/Heading";
import ContactDetail from "@/components/checkout/ContactDetail";
import Delivery from "@/components/checkout/Delivery";
import Shipping from "@/components/checkout/Shipping";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummary from "@/components/checkout/OrderSummery";
import { EmailSubscribedStatus } from "@/utils/Constant";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import Loader from "@/components/checkout/Loader";
import CommonButton from "@/components/common/CommonButton";
import { trackEcomEvent } from "@/utils/analytics";

export default function CheckoutClient() {
  const router = useRouter();
  const params = useParams();
  const cartId = params?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const { isLoggedIn, user } = useAuthStore((state) => state);
  const [checkoutOrder] = useMutation(CHECKOUT_ORDER);

  const { data: response, refetch } = useQuery(CART_LIST, {
    skip: !cartId,
    variables: { cartId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const cart = response?.getCart;
  const cartListPayload = useMemo(() => ({ cartId }), [cartId]);

  useEffect(() => {
    if (!cart?._id || !cart?.cart?.length) return;
    trackEcomEvent.beginCheckout(
      cart.cart,
      cart.discountedPrice ?? cart.totalprice ?? 0
    );
  }, [cart?._id]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CheckoutSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      shippingAddress: {
        addressType: "HOME",
        countryCode: "+91",
        country: "India",
        primary: true,
      },
      billingAddress: {
        addressType: "HOME",
        countryCode: "+91",
        country: "India",
        primary: false,
      },
      emailSubscribedStatus: EmailSubscribedStatus.SUBSCRIBED,
      useShippingAsBilling: true,
    },
  });

  useEffect(() => {
    if (isLoggedIn) {
      setValue("email", user?.email);
      setValue(
        "emailSubscribedStatus",
        user?.emailSubscribedStatus || EmailSubscribedStatus.NEVER_SUBSCRIBED
      );
    }
  }, [isLoggedIn, setValue, user]);

  const handleOrderPayment = async (payload) => {
    try {
      setIsPageLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/payment/handle-order-payment`,
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            dbtoken: `Bearer ${process.env.NEXT_PUBLIC_DB_TOKEN || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`Failed with status ${response.status}`);
      const result = await response.json();
      const { redirectUrl, awb_code } = result.data || {};
      if (redirectUrl) {
        let nextUrl = redirectUrl;
        if (awb_code) {
          const sep = nextUrl.includes("?") ? "&" : "?";
          nextUrl = `${nextUrl}${sep}awb_code=${encodeURIComponent(awb_code)}`;
        }
        router.push(nextUrl);
      }
    } catch (error) {
      console.error(`Error in Payment Order: ${error?.message}`);
      return null;
    } finally {
      setIsPageLoading(false);
    }
  };

  const launchNimbblSonicCheckout = async (token) => {
    try {
      const { default: NimbblCheckout } = await import("nimbbl_sonic");
      const checkout = new NimbblCheckout({ token });
      checkout.open({
        callback_handler: async function (response) {
          try {
            if (
              response?.event_type === "globalCloseCheckoutModal" &&
              response?.payload
            ) {
              await handleOrderPayment(response.payload);
            }
          } catch (err) {
            console.error("Error in callback_handler:", err);
          }
        },
      });
    } catch (error) {
      console.error("Error launching checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const {
        email,
        emailSubscribedStatus,
        shippingAddress,
        useShippingAsBilling,
      } = data;

      const billingAddress = useShippingAsBilling
        ? shippingAddress
        : data.billingAddress;

      const payload = {
        userData: {
          firstName: shippingAddress.firstname,
          lastName: shippingAddress.lastname,
          email,
          phoneNumber: shippingAddress.phone,
          countryCode: shippingAddress.countryCode,
          emailSubscribedStatus,
        },
        cartId: cart?._id,
        shippingAddress: { email, ...shippingAddress },
        billingAddress: { email, ...billingAddress },
      };

      const { data: response } = await checkoutOrder({
        variables: { input: payload },
      });
      const { token } = response?.clientCheckout?.nimbblData || {};
      launchNimbblSonicCheckout(token);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      toast.error(err?.message || "Failed");
    }
  };

  return (
    <>
      <div className="checkout-cont" data-lenis-prevent>
        <div className="checkout-left">
          <Heading />
          <form onSubmit={handleSubmit(onSubmit)} className="checkout-main">
            <ContactDetail
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
            <Delivery
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
            />
            <Shipping />
            <BillingAddress
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
            />
            <CommonButton title={"Pay now"} loading={isLoading} />
          </form>
        </div>
        <div className="checkout-right">
          <OrderSummary
            data={cart}
            refetch={() => refetch(cartListPayload)}
          />
        </div>
      </div>
      <Loader isLoading={isPageLoading} />
    </>
  );
}
