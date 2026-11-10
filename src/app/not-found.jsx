/**
 * 404 (was `pages/404.jsx`; PRD-014 UX-36: a way back instead of a dead end).
 */

import Link from "next/link";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Page Not Found – DeVeSheDreams",
  description:
    "The page you're looking for doesn’t exist. Explore DeVeSheDreams and discover wearable art, creative fashion, and expressive capsule collections.",
  keywords: ["404", "page not found", "DeVeSheDreams error page"],
  author: "DeVeSheDreams",
  robots: "noindex, follow",
  og: {
    title: "Page Not Found – DeVeSheDreams",
    description:
      "This page does not exist. Explore DeVeSheDreams to discover artistic fashion and wearable creativity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Not Found – DeVeSheDreams",
    description: "Page not found on DeVeSheDreams.",
  },
};

export const metadata = toMetadata(META, "/404");

// ─── Styles ───────────────────────────────────────────────────────────────

const style = {
  height: "100vh",
  fontSize: "1.875rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

const linkStyle = {
  marginTop: "1.5rem",
  fontSize: "1rem",
  textDecoration: "underline",
};

// ─── Page ─────────────────────────────────────────────────────────────────

const NotFound = () => (
  <div style={style}>
    <p>Sorry, we couldn't find the page you're looking for.</p>
    <p>Page not found</p>
    <Link href="/" style={linkStyle}>
      Back to home
    </Link>
  </div>
);

export default NotFound;
