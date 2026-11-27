/**
 * /email/confirm (backend PRD-050 FR-3.8): the target of the link in the
 * `consent_confirm` email (double opt-in).
 * Never indexed and kept out of the crawl; the canonical is fixed, so the
 * link's token never reaches it.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import EmailConfirmView from "@/views/EmailConfirmView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";
import { EMAIL_CONFIRM_PATH } from "@/utils/email-consent.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Confirm your subscription – DeVeSheDreams",
  description: "Confirm your DeVeSheDreams email subscription.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}${EMAIL_CONFIRM_PATH}`,
  og: {
    title: "Confirm your subscription – DeVeSheDreams",
    description: "Confirm your DeVeSheDreams email subscription.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Confirm your subscription – DeVeSheDreams",
    description: "Confirm your DeVeSheDreams email subscription.",
  },
};

export const metadata = toMetadata(META, EMAIL_CONFIRM_PATH);

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path={EMAIL_CONFIRM_PATH} />
      <EmailConfirmView />
    </>
  );
}
