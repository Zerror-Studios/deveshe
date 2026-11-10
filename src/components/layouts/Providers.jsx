"use client";

/**
 * Client providers for the App Router (kit PRD-002 FR-3.2): what
 * `pages/_app.jsx` did, around every page.
 *
 * - One Apollo client per browser session (SF-19); server pages create
 *   their own (`lib/catalog-listing.server.js`).
 * - Auth, the site layout (nav, bag drawer, footer, consent banner), the
 *   single Lenis scroller and the toasts.
 * - Once per load: legacy token clean-up, the visit attribution (PRD-012,
 *   analytics consent only) and the ad click ids (PRD-034 FR-1.4).
 * - A Meta Pixel PageView on each client-side navigation (PRD-034); the
 *   first one is sent when the Pixel loads, so the first path is skipped.
 */

import React, { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ApolloProvider } from "@apollo/client/react";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/layouts/Layout";
import SmoothScroller from "@/components/common/SmoothScroller";
import { createApolloClient } from "@/lib/apolloClient";
import { AuthProvider } from "@/context/AuthContext";
import { TokenManager } from "@/utils/tokenManager";
import { startVisitAttribution } from "@/utils/ga-attribution.util";
import { startAdClickCapture } from "@/utils/ad-click-ids.util";
import { pageview as trackPixelPageView } from "@/lib/fpixel";

// ─── Page views ───────────────────────────────────────────────────────────

const PixelPageViews = () => {
  const pathname = usePathname();
  const firstPathRef = useRef(true);

  useEffect(() => {
    if (firstPathRef.current) {
      firstPathRef.current = false;
      return;
    }
    trackPixelPageView();
  }, [pathname]);

  return null;
};

// ─── Providers ────────────────────────────────────────────────────────────

const Providers = ({ children }) => {
  const [client] = useState(() => createApolloClient());

  useEffect(() => {
    TokenManager.clearLegacyStorage();
    const stopVisitAttribution = startVisitAttribution();
    const stopAdClickCapture = startAdClickCapture();
    return () => {
      stopVisitAttribution();
      stopAdClickCapture();
    };
  }, []);

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Layout>
          {/* useSearchParams needs a Suspense boundary (static pages) */}
          <Suspense fallback={null}>
            <SmoothScroller />
          </Suspense>
          <PixelPageViews />
          {children}
        </Layout>
      </AuthProvider>
      <ToastContainer position="top-right" />
    </ApolloProvider>
  );
};

export default Providers;
