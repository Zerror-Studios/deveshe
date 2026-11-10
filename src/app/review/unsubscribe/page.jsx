/**
 * /review/unsubscribe (kit PRD-002 FR-3.1; was `pages/review/unsubscribe.jsx`). Never indexed; the canonical
 * is fixed, so the link's query never reaches it.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import ReviewUnsubscribeView from "@/views/ReviewUnsubscribeView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Review emails – DeVeSheDreams",
  description: "Stop review request emails from DeVeSheDreams.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/review/unsubscribe`,
  og: {
    title: "Review emails – DeVeSheDreams",
    description: "Stop review request emails from DeVeSheDreams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review emails – DeVeSheDreams",
    description: "Stop review request emails from DeVeSheDreams.",
  },
};

export const metadata = toMetadata(META, "/review/unsubscribe");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path={"/review/unsubscribe"} />
      <ReviewUnsubscribeView />
    </>
  );
}
