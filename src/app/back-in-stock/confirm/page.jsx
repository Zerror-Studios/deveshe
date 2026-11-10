/**
 * /back-in-stock/confirm (kit PRD-002 FR-3.1; was `pages/back-in-stock/confirm.jsx`). Never indexed; the canonical
 * is fixed, so the link's query never reaches it.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import BackInStockConfirmView from "@/views/BackInStockConfirmView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";
import { BACK_IN_STOCK_CONFIRM_PATH } from "@/utils/back-in-stock.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Confirm your alert – DeVeSheDreams",
  description: "Confirm your DeVeSheDreams back-in-stock alert.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}${BACK_IN_STOCK_CONFIRM_PATH}`,
  og: {
    title: "Confirm your alert – DeVeSheDreams",
    description: "Confirm your DeVeSheDreams back-in-stock alert.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Confirm your alert – DeVeSheDreams",
    description: "Confirm your DeVeSheDreams back-in-stock alert.",
  },
};

export const metadata = toMetadata(META, BACK_IN_STOCK_CONFIRM_PATH);

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path={BACK_IN_STOCK_CONFIRM_PATH} />
      <BackInStockConfirmView />
    </>
  );
}
