import React, { Suspense } from "react";
import ThankYouClient from "./ThankYouClient";

const meta = {
  title: "Thank You for Your Order – DeVeSheDreams",
  description:
    "Thank you for your order! Your DeVeSheDreams purchase has been successfully placed. We’ll notify you with shipping details and updates.",
  keywords: [
    "DeVeSheDreams order confirmation",
    "order received",
    "thank you for your order",
    "purchase confirmation",
    "order success",
  ],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Thank You for Your Order – DeVeSheDreams",
    description:
      "Your order has been successfully placed at DeVeSheDreams. Thank you for shopping with us! We’ll keep you updated on your order status.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thank You for Your Order – DeVeSheDreams",
    description:
      "Order received! DeVeSheDreams will send you updates on your order status and shipping details.",
  },
};

export async function generateMetadata() {
  return {
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    keywords: meta.keywords,
    authors: [{ name: meta.author }],
    openGraph: {
      title: meta.og.title,
      description: meta.og.description,
      siteName: "DeVeSheDreams",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: meta.twitter.card,
      title: meta.twitter.title,
      description: meta.twitter.description,
    },
  };
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouClient />
    </Suspense>
  );
}

