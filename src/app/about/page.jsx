import React from "react";
import AboutClient from "./AboutClient";

const meta = {
  title: "About – The Story of DeVeSheDreams",
  description:
    "DeVeSheDreams is a Mumbai-based fashion brand born from a passion for creativity and global influences. Discover our vision, founder, and artistic journey through innovative fashion and collaborations.",
  keywords: [
    "DeVeSheDreams about",
    "fashion brand story",
    "Mumbai fashion",
    "brand vision",
    "founder journey",
    "creative collaborations",
  ],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "About – The Story of DeVeSheDreams",
    description:
      "Explore the journey of DeVeSheDreams, a Mumbai-based fashion brand driven by creativity, global influences, and artistic collaborations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "About – The Story of DeVeSheDreams",
    description:
      "Learn about DeVeSheDreams, our vision, founder, and artistic journey as a creative and globally-inspired fashion brand.",
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

export default function AboutPage() {
  return <AboutClient />;
}

