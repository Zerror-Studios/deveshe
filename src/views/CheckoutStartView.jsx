"use client";

/**
 * Checkout link: `/checkout/start?products=<variantId>:<qty>,…` (PRD-034 FR-1.9)
 *
 * Meta (Shops, ads) and the product feed send shoppers here. The page
 * checks the link (`utils/checkout-start.util.js`), finds each variant's
 * product (`getVariantAvailability`: published products only), adds the
 * lines with the normal cart operation (`addItemToCart`, ids and qty only;
 * a guest through the server-issued guest id) and opens checkout.
 * Checkout is customer-only, so a guest goes to login and comes back to
 * `?resume=1`, which opens the bag merged at login. A bad link shows a
 * friendly message with a link to the shop. Public route (middleware).
 */

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import CommonButton from "@/components/common/CommonButton";
import {
  ADD_ITEM_TO_CART,
  CART_LIST,
  GET_VARIANT_AVAILABILITY,
} from "@/graphql";
import { runWithGuestId } from "@/hooks/useVisitor";
import { useAuthStore } from "@/store/auth-store";
import { getLoginPath } from "@/utils/redirect.util";
import {
  CHECKOUT_START_RESUME_PATH,
  CheckoutStartErrorEnum,
  getCheckoutStartMessage,
  parseCheckoutStartProducts,
} from "@/utils/checkout-start.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

const toError = (reason) => Object.assign(new Error(reason), { reason });

/** `{ variantId → productId }` for the published variants among `lines`. */
async function findProducts(client, lines) {
  const { data } = await client.query({
    query: GET_VARIANT_AVAILABILITY,
    variables: { variantIds: lines.map((line) => line.variantId) },
    fetchPolicy: "network-only",
  });
  const products = new Map();
  for (const row of data?.getVariantAvailability || []) {
    if (row?.variantId && row?.productId) {
      products.set(String(row.variantId), String(row.productId));
    }
  }
  return products;
}

/** The signed-in customer's bag id (after the adds, or merged at login). */
async function findCartId(client) {
  const { data } = await client.query({
    query: CART_LIST,
    fetchPolicy: "network-only",
  });
  return data?.getCart?.cart?.length ? data.getCart._id : null;
}

// ─── Page ─────────────────────────────────────────────────────────────────

const CheckoutStart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useApolloClient();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const openCheckout = async () => {
      const cartId = await findCartId(client);
      if (!cartId) throw toError(CheckoutStartErrorEnum.FAILED);
      await router.replace(`/checkout/${cartId}`);
    };

    (async () => {
      try {
        // Back from login: the guest bag was merged into the customer's
        if (searchParams.get("resume") && isLoggedIn) {
          await openCheckout();
          return;
        }

        const { lines, error: parseError } = parseCheckoutStartProducts(
          searchParams.get("products"),
        );
        if (parseError) throw toError(parseError);

        const products = await findProducts(client, lines);
        const known = lines.filter((line) => products.has(line.variantId));
        if (!known.length) throw toError(CheckoutStartErrorEnum.UNAVAILABLE);

        // One line at a time: each add re-prices the bag on the server
        let added = 0;
        for (const line of known) {
          const input = {
            productId: products.get(line.variantId),
            variantId: line.variantId,
            qty: line.qty,
          };
          try {
            if (isLoggedIn) {
              await client.mutate({ mutation: ADD_ITEM_TO_CART, variables: { input } });
            } else {
              await runWithGuestId(client, (guestId) =>
                client.mutate({
                  mutation: ADD_ITEM_TO_CART,
                  variables: { input, guestId },
                }),
              );
            }
            added += 1;
          } catch {
            // A sold-out or withdrawn line is skipped; the rest still go in.
          }
        }
        if (!added) throw toError(CheckoutStartErrorEnum.UNAVAILABLE);

        if (isLoggedIn) {
          await openCheckout();
        } else {
          await router.replace(getLoginPath(CHECKOUT_START_RESUME_PATH));
        }
      } catch (caught) {
        setError(caught?.reason || CheckoutStartErrorEnum.FAILED);
      }
    })();
  }, []);

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
