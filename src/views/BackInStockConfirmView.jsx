"use client";

/**
 * Back-in-stock confirmation (PRD-020, child-PRD review CP-22)
 *
 * Target of the link in the `back_in_stock_confirm` email:
 * `/back-in-stock/confirm?token=…`. Never indexed, and kept out of the
 * crawl in `robots.txt.js` (a crawler that runs scripts would confirm).
 *
 * Reads `token` once, removes it from the address bar (so it doesn't
 * linger in history or analytics page URLs), then calls
 * `confirmBackInStock`. `true` confirms every pending alert of the
 * address (CP2-03); `false` or any other server error means the link is
 * unknown, used, replaced or expired; `RATE_LIMITED`
 * (by `extensions.reason`) and network failures offer a retry.
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/back-in-stock/confirm/confirm-client.jsx`.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CONFIRM_BACK_IN_STOCK } from "@/graphql";
import CommonButton from "@/components/common/CommonButton";
import {
  BACK_IN_STOCK_CONFIRM_PATH,
  backInStockConfirmStatusEnum as StatusEnum,
  getConfirmStatusFromAnswer,
  getConfirmStatusFromError,
  readConfirmToken,
} from "@/utils/back-in-stock.util";

// ─── Page ─────────────────────────────────────────────────────────────────

const BackInStockConfirm = () => {
  const tokenRef = useRef(null);
  const [status, setStatus] = useState(StatusEnum.LOADING);
  const [confirm] = useMutation(CONFIRM_BACK_IN_STOCK);

  const run = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) {
      setStatus(StatusEnum.INVALID_LINK);
      return;
    }
    setStatus(StatusEnum.LOADING);
    try {
      const { data } = await confirm({ variables: { token } });
      setStatus(getConfirmStatusFromAnswer(data?.confirmBackInStock));
    } catch (error) {
      setStatus(getConfirmStatusFromError(error));
    }
  }, [confirm]);

  useEffect(() => {
    // Once per page view: read the token, then drop it from the address
    // bar (a shallow replace, as before).
    if (tokenRef.current !== null) return;
    const query = new URLSearchParams(window.location.search);
    tokenRef.current = readConfirmToken(query.get("token"));
    window.history.replaceState(null, "", BACK_IN_STOCK_CONFIRM_PATH);
    run();
  }, [run]);

  const isLoading = status === StatusEnum.LOADING;
  const canRetry =
    status === StatusEnum.RATE_LIMITED || status === StatusEnum.NETWORK_ERROR;

  return (
    <>
      <div id="status_section" aria-live="polite" aria-busy={isLoading}>
        {isLoading && (
          <>
            <h2>Confirming…</h2>
            <p>This will only take a moment.</p>
          </>
        )}
        {status === StatusEnum.CONFIRMED && (
          <>
            <h2>
              You&apos;re <span>in</span>
            </h2>
            <p>
              We&apos;ll email you when the items you asked about are back in
              stock.
            </p>
          </>
        )}
        {status === StatusEnum.INVALID_LINK && (
          <>
            <h2>Link expired</h2>
            <p>
              This link has expired, was already used or was replaced by a
              newer email. Use the newest link we sent, or tap &quot;Notify
              me&quot; again tomorrow for a new one.
            </p>
          </>
        )}
        {status === StatusEnum.RATE_LIMITED && (
          <>
            <h2>
              Try <span>later</span>
            </h2>
            <p>
              We&apos;ve had a lot of requests. Please try again in a little
              while.
            </p>
          </>
        )}
        {status === StatusEnum.NETWORK_ERROR && (
          <>
            <h2>
              Not <span>done</span>
            </h2>
            <p>
              We couldn&apos;t reach the store. Please check your connection
              and try again.
            </p>
          </>
        )}
        {canRetry && (
          <CommonButton title={"Try Again"} type="button" onClick={run} />
        )}
        {!isLoading && !canRetry && (
          <CommonButton title={"Go Back to Home"} type="button" href={"/"} />
        )}
      </div>
    </>
  );
};

export default BackInStockConfirm;
