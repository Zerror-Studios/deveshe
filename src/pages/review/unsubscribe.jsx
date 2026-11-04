/**
 * Stop review requests (PRD-032 FR-R5)
 *
 * Target of the review-request email footer: `/review/unsubscribe?email=…&
 * token=…`. Reads both once, removes them from the address bar, then calls
 * `unsubscribeReviewRequests`. The server answers the same for any email or
 * token, so every server answer shows one neutral message; only a network
 * failure offers a retry. Never indexed. Same pattern as `/unsubscribe`.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useMutation } from "@apollo/client/react";
import { UNSUBSCRIBE_REVIEW_REQUESTS } from "@/graphql";
import SeoHeader from "@/components/seo/SeoHeader";
import CommonButton from "@/components/common/CommonButton";
import { Const } from "@/utils/Constant";

// ─── Constants ────────────────────────────────────────────────────────────

const StatusEnum = {
  LOADING: "LOADING",
  DONE: "DONE",
  INVALID_LINK: "INVALID_LINK",
  NETWORK_ERROR: "NETWORK_ERROR",
};

const PAGE_PATH = "/review/unsubscribe";

const META = {
  title: "Review emails – DeVeSheDreams",
  description: "Stop review request emails from DeVeSheDreams.",
  author: "DeVeSheDreams",
  robots: "noindex, nofollow",
  canonical: `${Const.ClientLink}${PAGE_PATH}`,
  og: {
    title: "Review emails – DeVeSheDreams",
    description: "Stop review request emails from DeVeSheDreams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Review emails – DeVeSheDreams",
    description: "Stop review request emails from DeVeSheDreams.",
  },
};

const firstValue = (value) => (Array.isArray(value) ? value[0] : value) || "";

// ─── Page ─────────────────────────────────────────────────────────────────

const ReviewUnsubscribe = () => {
  const router = useRouter();
  const linkRef = useRef(null);
  const [status, setStatus] = useState(StatusEnum.LOADING);
  const [unsubscribe] = useMutation(UNSUBSCRIBE_REVIEW_REQUESTS);

  const run = useCallback(async () => {
    const { email, token } = linkRef.current || {};
    if (!email || !token) {
      setStatus(StatusEnum.INVALID_LINK);
      return;
    }
    setStatus(StatusEnum.LOADING);
    try {
      await unsubscribe({ variables: { email, token } });
      setStatus(StatusEnum.DONE);
    } catch (error) {
      setStatus(CombinedGraphQLErrors.is(error) ? StatusEnum.DONE : StatusEnum.NETWORK_ERROR);
    }
  }, [unsubscribe]);

  useEffect(() => {
    if (!router.isReady || linkRef.current) return;
    linkRef.current = {
      email: firstValue(router.query.email).trim(),
      token: firstValue(router.query.token),
    };
    router.replace(PAGE_PATH, undefined, { shallow: true });
    run();
  }, [router, run]);

  const isLoading = status === StatusEnum.LOADING;

  return (
    <>
      <SeoHeader meta={META} />
      <div id="status_section" aria-live="polite" aria-busy={isLoading}>
        {isLoading && (
          <>
            <h2>One moment…</h2>
            <p>This will only take a moment.</p>
          </>
        )}
        {status === StatusEnum.DONE && (
          <>
            <h2>Done</h2>
            <p>You won&apos;t get review requests from us again.</p>
          </>
        )}
        {status === StatusEnum.INVALID_LINK && (
          <>
            <h2>Link incomplete</h2>
            <p>Please use the link from one of our review emails.</p>
          </>
        )}
        {status === StatusEnum.NETWORK_ERROR && (
          <>
            <h2>
              Not <span>done</span>
            </h2>
            <p>We couldn&apos;t reach the store. Please check your connection and try again.</p>
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

export default ReviewUnsubscribe;
