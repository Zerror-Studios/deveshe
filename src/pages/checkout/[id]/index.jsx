import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutSchema } from "@/validations/CheckoutValidation";
import { createApolloClient } from "@/lib/apolloClient";
import { useMutation, useQuery } from "@apollo/client";
import { CART_LIST, CHECKOUT_ORDER, USER_ADDRESS_LIST } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import Heading from "@/components/checkout/Heading";
import ContactDetail from "@/components/checkout/ContactDetail";
import Delivery from "@/components/checkout/Delivery";
import Shipping from "@/components/checkout/Shipping";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummery from "@/components/checkout/OrderSummery";
import { EmailSubscribedStatus, Sort } from "@/utils/Constant";
import Checkout from "nimbbl_sonic";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/auth-store";
import Loader from "@/components/checkout/Loader";
import gsap from "gsap";
import CommonButton from "@/components/common/CommonButton";
const CheckoutPage = ({ meta, initialCartData }) => {
  const router = useRouter();
  const [cartData, setCartData] = useState(initialCartData);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const { isLoggedIn, user } = useAuthStore((state) => state);
  const [checkoutOrder] = useMutation(CHECKOUT_ORDER);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CheckoutSchema),
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
  }, [isLoggedIn]);

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

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      const result = await response.json();
      const { redirectUrl, awb_code } = result.data || {};
      if (redirectUrl) {
        await router.push(
          {
            pathname: redirectUrl,
            ...(awb_code ? { query: { awb_code } } : {}),
          },
          undefined,
          { shallow: true }
        );
        setIsPageLoading(false);
      }
    } catch (error) {
      console.error(`Error in Payment Order: ${error.message}`);
      setIsPageLoading(false);
      return null;
    }
  };

  const launchNimbblSonicCheckout = async (token) => {
    try {
      const checkout = new Checkout({ token });

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
      const { email, emailSubscribedStatus, shippingAddress, billingAddress } =
        data;

      const payload = {
        userData: {
          firstName: shippingAddress.firstname,
          lastName: shippingAddress.lastname,
          email,
          phoneNumber: shippingAddress.phone,
          countryCode: shippingAddress.countryCode,
          emailSubscribedStatus,
        },
        cartId: cartData?._id,
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
      toast.error(err.message || "Failed");
    }
  };
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.out" },
    });

    gsap.set([leftRef.current, rightRef.current], {
      opacity: 0,
      y: 100,
    });

    tl.to([leftRef.current, rightRef.current], {
      opacity: 1,
      y: 0,
      duration: 1,
    });
  }, []);

  return (
    <>
      <SeoHeader meta={meta} />
      <div className="checkout-cont">
        <div className="checkout-left" ref={leftRef}>
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
        <div className="checkout-right" ref={rightRef}>
          <OrderSummery cartData={cartData || {}} setCartData={setCartData} />
        </div>
      </div>
      <Loader isLoading={isPageLoading} />
    </>
  );
};

export default CheckoutPage;

export async function getServerSideProps({ params }) {
  const meta = {
    title: "Checkout – DeVeSheDreams",
    description:
      "Review your cart, enter shipping details, and complete your DeVeSheDreams order securely.",
    keywords:
      "checkout, DeVeSheDreams cart, order process, shipping information, payment",
    author: "DeVeSheDreams",
    robots: "noindex,follow",
  };
  try {
    const cartId = params?.id || null;
    const client = createApolloClient();
    const { data: response } = await client.query({
      query: CART_LIST,
      variables: { cartId },
    });
    const data = response?.getCart || {};
    return {
      props: {
        meta: meta,
        initialCartData: data,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return {
      props: {
        meta: meta,
        initialCartData: {},
      },
    };
  }
}
