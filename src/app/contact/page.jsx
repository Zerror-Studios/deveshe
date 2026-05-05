import React from "react";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

const meta = {
  title: "Contact Us – DeVeSheDreams",
  description:
    "Get in touch with DeVeSheDreams for any queries, support, or feedback. Our team is here to assist you with your fashion experience.",
  keywords: [
    "DeVeSheDreams contact",
    "customer support",
    "help",
    "feedback",
    "reach us",
    "inquiries",
  ],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "Contact Us – DeVeSheDreams",
    description:
      "Reach out to DeVeSheDreams for support, inquiries, or feedback and let us assist you with your fashion experience.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us – DeVeSheDreams",
    description:
      "Contact DeVeSheDreams for any questions, support, or feedback. Our team is ready to help you.",
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

export default function ContactPage() {
  return <ContactClient />;
}

