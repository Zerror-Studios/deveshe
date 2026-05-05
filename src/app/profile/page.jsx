import React from "react";
import ProfileClient from "./ProfileClient";

const meta = {
  title: "Your Account – DeVeSheDreams",
  description:
    "Access and manage your DeVeSheDreams account. View orders, update personal details, and explore your personalised fashion experience.",
  keywords: [
    "DeVeSheDreams account",
    "login",
    "user dashboard",
    "order history",
    "account settings",
    "profile management",
  ],
  author: "DeVeSheDreams",
  robots: "noindex, follow",
  og: {
    title: "Your Account – DeVeSheDreams",
    description:
      "Manage your DeVeSheDreams account, track orders, and update your personal information in one secure place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Account – DeVeSheDreams",
    description:
      "Log in to your DeVeSheDreams account to manage your orders and profile details.",
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

export default function ProfilePage() {
  return <ProfileClient />;
}

