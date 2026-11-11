"use client";

/**
 * Client providers (kit PRD-002 FR-3.2, FR-4.1).
 *
 * - The kit's `ZcomSsrProvider`: one Apollo Client 4 shared with the
 *   store's own queries, the customer session (in-memory token, HttpOnly
 *   refresh cookie), the guest cart id, the visit attribution and ad click
 *   ids (consent-gated), and the one-time move of the pre-kit storage keys
 *   (sign-in hint, guest bag, consent, click ids).
 * - The kit's `ZcomTags`: GA4 / GTM with analytics consent, the Meta Pixel
 *   and Google Ads with ads (marketing) consent, a Pixel PageView per
 *   navigation. The backend's `storefrontTrackingConfig` ids win; GA4 and
 *   GTM fall back to env (PRD-034: no env fallback for the ads ids).
 * - The store's auth context, layout, single Lenis scroller and toasts.
 */

import React, { Suspense } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ZcomSsrProvider } from "@zcom/storefront-kit/ssr";
import { registerNimbblCheckout, ZcomTags } from "@zcom/storefront-kit/client";
import Layout from "@/components/layouts/Layout";
import SmoothScroller from "@/components/common/SmoothScroller";
import { AuthProvider } from "@/context/AuthContext";
import { zcomConfig } from "@/zcom.config";

// ─── Constants ────────────────────────────────────────────────────────────

// Nimbbl until its 2026-11-15 shutdown (backend PRD-029 D1): the kit opens
// this store's Sonic for a NIMBBL checkout; the module loads only on "Pay".
registerNimbblCheckout(() => import("nimbbl_sonic").then((m) => m.default));

const STORE_UNAVAILABLE_TOAST_ID = "store-unavailable";
const TAG_ID_FALLBACK = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
};

// PRD-002 R2-C5: one notice while the gateway answers TENANT_NOT_FOUND
const showStoreUnavailable = () =>
  toast.error("This store is unavailable right now. Please try later.", {
    toastId: STORE_UNAVAILABLE_TOAST_ID,
  });

// ─── Providers ────────────────────────────────────────────────────────────

const Providers = ({ children }) => (
  <ZcomSsrProvider
    config={zcomConfig}
    onStoreUnavailable={showStoreUnavailable}
  >
    <ZcomTags fallback={TAG_ID_FALLBACK} />
    <AuthProvider>
      <Layout>
        {/* useSearchParams needs a Suspense boundary (static pages) */}
        <Suspense fallback={null}>
          <SmoothScroller />
        </Suspense>
        {children}
      </Layout>
    </AuthProvider>
    <ToastContainer position="top-right" />
  </ZcomSsrProvider>
);

export default Providers;
