"use client";

/**
 * Email confirmation (backend PRD-050 FR-3.6, FR-3.8: double opt-in)
 *
 * The kit's `useEmailConfirmPage` reads `token` once, removes it from the
 * address bar (it carries the address, so it must not linger in history or
 * analytics page URLs), checks its shape and calls `confirmEmailConsent`
 * once. Rate-limited and network failures offer a retry with the token
 * kept in memory.
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/email/confirm/confirm-client.jsx`.
 */
import React from "react";
import { useEmailConfirmPage } from "@zcom/storefront-kit/client";
import CommonButton from "@/components/common/CommonButton";
import { getConfirmPageCopy } from "@/utils/email-consent.util";

// ─── Component ────────────────────────────────────────────────────────────

const EmailConfirmView = () => {
  const { state, retry } = useEmailConfirmPage();
  const copy = getConfirmPageCopy(state);
  const isLoading = state === "working";

  return (
    <div id="status_section" aria-live="polite" aria-busy={isLoading}>
      <h2>
        {copy.title} <span>{copy.accent}</span>
      </h2>
      <p>{copy.body}</p>
      {copy.canRetry && (
        <CommonButton title={"Try Again"} type="button" onClick={retry} />
      )}
      {!isLoading && !copy.canRetry && (
        <CommonButton title={"Go Back to Home"} type="button" href={"/"} />
      )}
    </div>
  );
};

export default EmailConfirmView;
