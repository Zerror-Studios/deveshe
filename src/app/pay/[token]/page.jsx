/**
 * /pay/[token] (kit PRD-002 FR-3.1; was `pages/pay/[token].jsx` with
 * getServerSideProps). Data: `lib/page-data/pay.server.js`.
 *
 * Never indexed and never sent on as a referrer (the URL holds the token):
 * the `X-Robots-Tag` and `Referrer-Policy` headers come from
 * `next.config.mjs`, and Next sends a private, no-store Cache-Control for
 * this dynamic page, so no shared cache keeps it.
 */

import { headers } from "next/headers";
import PageSchemas from "@/components/seo/PageSchemas";
import PayView from "@/views/PayView";
import { loadPayPage } from "@/lib/page-data/pay.server";
import { toMetadata } from "@/lib/seo-metadata.util";
import { Const } from "@/utils/Constant";

// ─── Metadata ─────────────────────────────────────────────────────────────

// The canonical never carries the token
const META = {
  title: "Pay for your order – DeVeSheDreams",
  description: "Pay for your DeVeSheDreams order securely.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}/pay`,
  og: {
    title: "Pay for your order – DeVeSheDreams",
    description: "Pay for your DeVeSheDreams order securely.",
  },
  twitter: {
    card: "summary",
    title: "Pay for your order – DeVeSheDreams",
    description: "Pay for your DeVeSheDreams order securely.",
  },
};

export const metadata = {
  ...toMetadata(META, "/pay"),
  referrer: "no-referrer",
};

// A shopper's link: read per request
export const dynamic = "force-dynamic";

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function Page({ params, searchParams }) {
  const { token } = await params;
  const data = await loadPayPage(
    typeof token === "string" ? token : "",
    await searchParams,
    await headers(),
  );
  return (
    <>
      <PageSchemas meta={META} path="/pay" />
      <PayView {...data} />
    </>
  );
}
