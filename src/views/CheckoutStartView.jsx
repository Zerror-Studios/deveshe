"use client";

/**
 * Checkout link: `/checkout/start?products=<variantId>:<qty>,…` (PRD-034 FR-1.9)
 *
 * Meta (Shops, ads) and the product feed send shoppers here. The kit's
 * `useCheckoutStart` (kit PRD-002 FR-4.1) checks the link and adds its
 * lines to the shopper's bag (signed-in customer, or the server-issued
 * guest id), once per link and tab, skipping archived or sold-out
 * variants. Then this opens checkout. Checkout is customer-only, so a
 * guest goes to login and comes back to `?resume=1`, which opens the bag
 * merged at login (the merged bag is the customer's own cart, so its id
 * is read after login). A bad link shows a friendly message with a link to
 * the shop. Public route (proxy).
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { useCheckoutStart } from "@zcom/storefront-kit/client";
import CommonButton from "@/components/common/CommonButton";
import { CART_LIST } from "@/graphql";
import { useAuthStore } from "@/store/auth-store";
import { getLoginPath } from "@/utils/redirect.util";
import {
  CHECKOUT_START_OPEN_FAILED,
  CHECKOUT_START_RESUME_PATH,
  getCheckoutStartMessage,
} from "@/utils/checkout-start.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** The signed-in customer's bag id (after the adds, or merged at login). */
async function findCartId(client) {
  const { data } = await client.query({
    query: CART_LIST,
    fetchPolicy: "network-only",
  });
  return data?.getCart?.cart?.length ? data.getCart._id : null;
}

// ─── View ─────────────────────────────────────────────────────────────────

const CheckoutStart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApolloClient();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // Back from login: the guest bag was merged into the customer's
  const isResume = Boolean(searchParams.get("resume")) && isLoggedIn;
  // The kit adds the link's items once per link and tab (not on resume)
  const state = useCheckoutStart(
    isResume ? null : searchParams.get("products"),
  );
  const [openError, setOpenError] = useState(null);
  const openedRef = useRef(false);
  const error =
    openError || (!isResume && state.status === "error" ? state.errorKey : null);

  useEffect(() => {
    if (openedRef.current) return;
    if (!isResume && state.status !== "ready") return;
    openedRef.current = true;

    if (!isLoggedIn) {
      router.replace(getLoginPath(CHECKOUT_START_RESUME_PATH));
      return;
    }
    findCartId(client)
      .then((cartId) => {
        if (!cartId) {
          setOpenError(CHECKOUT_START_OPEN_FAILED);
          return;
        }
        router.replace(`/checkout/${encodeURIComponent(cartId)}`);
      })
      .catch(() => setOpenError(CHECKOUT_START_OPEN_FAILED));
  }, [state.status, isResume, isLoggedIn, client, router]);

  return (
    <>
      <div id="status_section" aria-live="polite">
        {error ? (
          <>
            <h2>
              Let&rsquo;s find <br /> your <span>pieces</span>
            </h2>
            <p>{getCheckoutStartMessage(error)}</p>
            <CommonButton title={"Go to the shop"} href={"/products"} />
          </>
        ) : (
          <>
            <h2>
              Getting your <br /> <span>bag</span> ready
            </h2>
            <p>Adding your pieces and opening checkout&hellip;</p>
          </>
        )}
      </div>
    </>
  );
};

export default CheckoutStart;
