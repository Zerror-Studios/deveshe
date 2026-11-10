/**
 * /unsubscribe (kit PRD-002 FR-3.1; was `pages/unsubscribe/index.jsx`). Never indexed; the canonical
 * is fixed, so the link's query never reaches it.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import UnsubscribeView from "@/views/UnsubscribeView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Unsubscribe – DeVeSheDreams",
  description: "Manage your DeVeSheDreams newsletter subscription.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/unsubscribe`,
  og: {
    title: "Unsubscribe – DeVeSheDreams",
    description: "Manage your DeVeSheDreams newsletter subscription.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unsubscribe – DeVeSheDreams",
    description: "Manage your DeVeSheDreams newsletter subscription.",
  },
};

export const metadata = toMetadata(META, "/unsubscribe");

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path={"/unsubscribe"} />
      <UnsubscribeView />
    </>
  );
}
