/**
 * /about (kit PRD-002 FR-3.1; was `pages/about/index.jsx`).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import AboutView from "@/views/AboutView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "About – The Story of DeVeSheDreams",
  description:
    "DeVeSheDreams is a Mumbai-based fashion brand born from a passion for creativity and global influences. Discover our vision, founder, and artistic journey through innovative fashion and collaborations.",
  keywords: [
    "DeVeSheDreams about",
    "fashion brand story",
    "Mumbai fashion",
    "brand vision",
    "founder journey",
    "creative collaborations"
  ],
  primaryKeywords: ["DeVeSheDreams story", "fashion brand"],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "About – The Story of DeVeSheDreams",
    description:
      "Explore the journey of DeVeSheDreams, a Mumbai-based fashion brand driven by creativity, global influences, and artistic collaborations."
  },
  twitter: {
    card: "summary_large_image",
    title: "About – The Story of DeVeSheDreams",
    description:
      "Learn about DeVeSheDreams, our vision, founder, and artistic journey as a creative and globally-inspired fashion brand."
  }
};

export const metadata = toMetadata(META, "/about");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/about" />
      <AboutView />
    </>
  );
}
