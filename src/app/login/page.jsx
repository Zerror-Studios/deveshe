import React from "react";
import LoginClient from "./LoginClient";

const meta = {
  title: "Login – DeVeSheDreams",
  description:
    "Access your DeVeSheDreams account to manage orders, update your profile, and enjoy a personalized fashion experience.",
  keywords: [
    "DeVeSheDreams login",
    "account access",
    "sign in",
    "user account",
    "dashboard",
    "profile management",
  ],
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  og: {
    title: "Login – DeVeSheDreams",
    description:
      "Sign in to your DeVeSheDreams account to access your orders, profile, and personalized fashion recommendations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login – DeVeSheDreams",
    description:
      "Log in to your DeVeSheDreams account to manage your orders and profile details securely.",
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

export default function LoginPage() {
  return <LoginClient />;
}

