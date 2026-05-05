import React from "react";
import CheckoutClient from "./CheckoutClient";

const meta = {
  title: "Checkout – DeVeSheDreams",
  description:
    "Securely complete your purchase at DeVeSheDreams. Review your items, apply discounts, and choose your preferred payment method.",
  keywords: [
    "DeVeSheDreams checkout",
    "secure checkout",
    "shopping cart",
    "payment",
    "order review",
    "complete purchase",
  ],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Checkout – DeVeSheDreams",
    description:
      "Finalize your DeVeSheDreams order securely. Review your items, select payment options, and complete your purchase.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout – DeVeSheDreams",
    description:
      "Securely complete your DeVeSheDreams order. Review items, choose payment method, and finish your purchase.",
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

export default function CheckoutPage() {
  return <CheckoutClient />;
}

