/**
 * /email/preferences (backend PRD-050 FR-3.8): the target of the
 * preference link in every email.
 * Never indexed and kept out of the crawl; the canonical is fixed, so the
 * link's token never reaches it.
 */

import PageSchemas from "@/components/seo/PageSchemas";
import EmailPreferencesView from "@/views/EmailPreferencesView";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";
import { EMAIL_PREFERENCES_PATH } from "@/utils/email-consent.util";

// ─── Metadata ─────────────────────────────────────────────────────────────

const META = {
  title: "Email preferences – DeVeSheDreams",
  description: "Choose which DeVeSheDreams emails you receive.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}${EMAIL_PREFERENCES_PATH}`,
  og: {
    title: "Email preferences – DeVeSheDreams",
    description: "Choose which DeVeSheDreams emails you receive.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email preferences – DeVeSheDreams",
    description: "Choose which DeVeSheDreams emails you receive.",
  },
};

export const metadata = toMetadata(META, EMAIL_PREFERENCES_PATH);

// ─── Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
      <PageSchemas meta={META} path={EMAIL_PREFERENCES_PATH} />
      <EmailPreferencesView />
    </>
  );
}
