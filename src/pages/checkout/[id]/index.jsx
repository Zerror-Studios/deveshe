import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutSchema } from "@/validations/CheckoutValidation";
import { createApolloClient } from "@/lib/apolloClient";
import { useMutation } from "@apollo/client";
import { CART_LIST, CHECKOUT_ORDER } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import Heading from "@/components/checkout/Heading";
import ContactDetail from "@/components/checkout/ContactDetail";
import Delivery from "@/components/checkout/Delivery";
import Shipping from "@/components/checkout/Shipping";
// import Payment from "@/components/checkout/Payment";
import BillingAddress from "@/components/checkout/BillingAddress";
import OrderSummery from "@/components/checkout/OrderSummery";
import { EmailSubscribedStatus } from "@/utils/Constant";
import Checkout from "nimbbl_sonic";
const CheckoutPage = ({ meta, initialCartData }) => {
  const [cartData, setCartData] = useState(initialCartData);
  const [isLoading, setIsLoading] = useState(false);
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
      // paymentMethod: "debit_card",
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
      emailSubscribedStatus: EmailSubscribedStatus.SUBSCRIBED,
      useShippingAsBilling: true,
    },
  });

  const handleOrderPayment = async (payload) => {
    try {
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
      return await response.json();
    } catch (error) {
      console.error(`Error in Payment Order: ${error.message}`);
      return null;
    }
  };

  const launchNimbblSonicCheckout = async (token) => {
    try {
      const checkout = new Checkout({ token });

      checkout.open({
        callback_handler: async function (response) {
          try {
            console.log("Nimbbl response:", response);

            if (
              response?.event_type === "globalCloseCheckoutModal" &&
              response?.payload
            ) {
              const result = await handleOrderPayment(response.payload);
              console.log("Backend handle-order-payment result:", result);
            } else {
              console.warn("Unexpected Nimbbl response:", response);
            }
          } catch (err) {
            console.error("Error in callback_handler:", err);
          }
        },
      });
    } catch (error) {
      console.error("Error launching checkout:", error);
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
          phone: shippingAddress.phone,
          countryCode: shippingAddress.countryCode,
          emailSubscribedStatus,
        },
        cartId: cartData?._id,
        shippingAddress,
        billingAddress,
      };

      const { data: response } = await checkoutOrder({
        variables: { input: payload },
      });
      const { token } = response?.clientCheckout?.nimbblData || {};
      launchNimbblSonicCheckout(token);
      // const nimbblOrderPayload = {
      //   order_id: order_id,
      //   callback_url: `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}}/api/payment/handle-order-payment`,
      //   payment_mode_code: paymentMethod,
      //   card_no: cardDetails?.cardNumber || "",
      //   expiry: cardDetails?.cardExpire || "",
      //   card_holder_name: cardDetails?.cardHolderName || "",
      //   cvv: cardDetails?.cardCvv || "",
      //   transaction_currency: "INR",
      // };
      // const initiatePayment = await fetch(
      //   `${process.env.NEXT_PUBLIC_NIMBBL_BASE_URL}/api/v3/initiate-payment`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify(nimbblOrderPayload),
      //   }
      // );

      // if (!initiatePayment.ok) {
      //   toast.error(`Initiate payment failed: ${initiatePayment.statusText}`);
      // }

      // const paymentResponse = await initiatePayment.json();
      // const redirectAction = paymentResponse?.next?.find(
      //   (item) => item.action === "redirect"
      // );

      // if (redirectAction?.url) {
      //   window.location.href = redirectAction.url;
      // } else {
      //   toast.error("No redirect action found in payment response");
      // }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SeoHeader meta={meta} />
      <div className="checkout-cont">
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
            {/* <Payment register={register} errors={errors} /> */}
            <BillingAddress
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
            />
            <button
              disabled={isLoading}
              type="submit"
              style={{ marginTop: "30px" }}
            >
              {isLoading ? "Loading..." : "Pay now"}
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
