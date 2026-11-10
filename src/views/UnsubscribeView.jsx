"use client";

/**
 * Newsletter unsubscribe (PRD-002 VCON-1)
 *
 * Target of the unsubscribe link in newsletter emails:
 * `/unsubscribe?email=…&token=…`. Never indexed.
 *
 * Reads `email` and `token` once, removes them from the address bar (so
 * they don't linger in history or analytics page URLs), then calls
 * `unsubscribeNewsletter`. The server answers `true` for any email or token
 * (no subscription is revealed), so every server answer, including a
 * GraphQL error, shows the same neutral message. Only a network failure
 * offers a retry.
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/unsubscribe/unsubscribe-client.jsx`.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useMutation } from "@apollo/client/react";
import { UNSUBSCRIBE_NEWSLETTER } from "@/graphql";
import CommonButton from "@/components/common/CommonButton";

// ─── Constants ────────────────────────────────────────────────────────────

const StatusEnum = {
  LOADING: "LOADING",
  DONE: "DONE",
  INVALID_LINK: "INVALID_LINK",
  NETWORK_ERROR: "NETWORK_ERROR",
};

const PAGE_PATH = "/unsubscribe";

// ─── Page ─────────────────────────────────────────────────────────────────

const Unsubscribe = () => {
  const linkRef = useRef(null);
  const [status, setStatus] = useState(StatusEnum.LOADING);
  const [unsubscribe] = useMutation(UNSUBSCRIBE_NEWSLETTER);

  const run = useCallback(async () => {
    const { email, token } = linkRef.current || {};
    if (!email) {
      setStatus(StatusEnum.INVALID_LINK);
      return;
    }
    setStatus(StatusEnum.LOADING);
    try {
      await unsubscribe({ variables: { email, token: token || null } });
      setStatus(StatusEnum.DONE);
    } catch (error) {
      setStatus(
        CombinedGraphQLErrors.is(error)
          ? StatusEnum.DONE
          : StatusEnum.NETWORK_ERROR,
      );
    }
  }, [unsubscribe]);

  useEffect(() => {
    // Once per page view: read the link, then drop it from the address bar
    // (a shallow replace, as before), so it doesn't linger in history.
    if (linkRef.current) return;
    const query = new URLSearchParams(window.location.search);
    linkRef.current = {
      email: (query.get("email") || "").trim(),
      token: query.get("token") || "",
    };
    window.history.replaceState(null, "", PAGE_PATH);
    run();
  }, [run]);

  const isLoading = status === StatusEnum.LOADING;

  return (
    <>
      <div id="status_section" aria-live="polite" aria-busy={isLoading}>
        {isLoading && (
          <>
            <h2>Unsubscribing…</h2>
            <p>This will only take a moment.</p>
          </>
        )}
        {status === StatusEnum.DONE && (
          <>
            <h2>Unsubscribed</h2>
            <p>
              You&apos;ve been unsubscribed. You won&apos;t receive our
              newsletter at this address any more.
            </p>
          </>
        )}
        {status === StatusEnum.INVALID_LINK && (
          <>
            <h2>Link incomplete</h2>
            <p>Please use the unsubscribe link from one of our emails.</p>
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
            <CommonButton title={"Try Again"} type="button" onClick={run} />
          </>
        )}
        {!isLoading && status !== StatusEnum.NETWORK_ERROR && (
          <CommonButton title={"Go Back to Home"} type="button" href={"/"} />
        )}
      </div>
    </>
  );
};

export default Unsubscribe;
