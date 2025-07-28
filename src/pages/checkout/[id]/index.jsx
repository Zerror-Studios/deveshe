import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutSchema } from "@/validations/CheckoutValidation";
import { createApolloClient } from "@/lib/apolloClient";
import { CART_LIST } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import BackSection from "@/components/checkout/BackSection";
import Heading from "@/components/checkout/Heading";
import ContactDetail from "@/components/checkout/ContactDetail";
import Delivery from "@/components/checkout/Delivery";
import Shipping from "@/components/checkout/Shipping";
import Payment from "@/components/checkout/Payment";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummery from "@/components/checkout/OrderSummery";
const Checkout = ({ meta, initialCartData }) => {
  const [cartData, setCartData] = useState(initialCartData);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      paymentMethod: "credit-card",
      shippingAddress: {
        addressType: "SHIPPING",
        countryCode: "+91",
        country: "India",
        primary: true,
      },
      billingAddress: {
        addressType: "BILLING",
        countryCode: "+91",
        country: "India",
        primary: false,
      },
      emailSubscribedStatus: true,
      useShippingAsBilling: true,
    },
  });
  const onSubmit = async (data) => {
    try {
      console.log(data, "Form Data");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed");
    }
  };

  return (
    <>
      <SeoHeader meta={meta} />
      <BackSection />
      <div className="checkout-cont">
        <div className="checkout-left">
          <Heading />
          <form onSubmit={handleSubmit(onSubmit)} className="checkout-main">
            <ContactDetail register={register} errors={errors} />
            <Delivery
              control={control}
              errors={errors}
              register={register}
              setValue={setValue}
            />
            <Shipping />
            <Payment register={register} errors={errors} />
            <BillingAddress
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
            />
            <button type="submit" style={{ marginTop: "30px" }}>
              Pay now
            </button>
          </form>
        </div>
        <div className="checkout-right">
          <OrderSummery cartData={cartData || {}} setCartData={setCartData} />
        </div>
      </div>
    </>
  );
};

export default Checkout;

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
