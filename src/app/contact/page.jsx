/**
 * /contact (kit PRD-002 FR-3.1; was `pages/contact/index.jsx`).
 */

import PageSchemas from "@/components/seo/PageSchemas";
import ContactView from "@/views/ContactView";
import { toMetadata } from "@/lib/seo-metadata.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Contact Us – DeVeSheDreams",
  description:
    "Get in touch with DeVeSheDreams for any queries, support, or feedback. Our team is here to assist you with your fashion experience.",
  keywords: [
    "DeVeSheDreams contact",
    "customer support",
    "help",
    "feedback",
    "reach us",
    "inquiries"
  ],
  primaryKeywords: ["DeVeSheDreams contact", "customer support"],
  author: "DeVeSheDreams",
  robots: "index, follow",
  og: {
    title: "Contact Us – DeVeSheDreams",
    description:
      "Reach out to DeVeSheDreams for support, inquiries, or feedback and let us assist you with your fashion experience."
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us – DeVeSheDreams",
    description:
      "Contact DeVeSheDreams for any questions, support, or feedback. Our team is ready to help you."
  }
};

export const metadata = toMetadata(META, "/contact");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/contact" />
      <ContactView />
    </>
  );
}
