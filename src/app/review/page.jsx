/**
 * /review (kit PRD-002 FR-3.1; was `pages/review/index.jsx`). Never
 * indexed (robots.txt disallows `/review`); the canonical is fixed, so the
 * token in the link never reaches it.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import ReviewOrderView from "@/views/ReviewOrderView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Review your order – DeVeSheDreams",
  description: "Tell other shoppers what you think of your order.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/review`,
  og: {
    title: "Review your order – DeVeSheDreams",
    description: "Tell other shoppers what you think of your order.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review your order – DeVeSheDreams",
    description: "Tell other shoppers what you think of your order.",
  },
};

export const metadata = toMetadata(META, "/review");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path="/review" />
      <ReviewOrderView />
    </>
  );
}
