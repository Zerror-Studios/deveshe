"use client";

/**
 * Email preferences (backend PRD-050 FR-3.8)
 *
 * The kit's `useEmailPreferencesPage` reads `token` once (kept in memory,
 * removed from the address bar) and loads the masked address and its
 * marketing status. Unsubscribing asks once more before it saves, and
 * withdraws news and offers only: order emails keep coming.
 *
 * Keep in sync with
 * `storefronts/rare-element/src/app/email/preferences/preferences-client.jsx`.
 */
import React, { useState } from "react";
import { useEmailPreferencesPage } from "@zcom/storefront-kit/client";
import CommonButton from "@/components/common/CommonButton";
import {
  STORE_NAME,
  getConsentErrorMessage,
  getPreferencesPageCopy,
  getSavedMessage,
  getSubscriptionCopy,
} from "@/utils/email-consent.util";

// ─── Component ────────────────────────────────────────────────────────────

const EmailPreferencesView = () => {
  const { state, preferences, save, saving, saved, saveError, retry } =
    useEmailPreferencesPage();
  const [confirming, setConfirming] = useState(false);

  if (state !== "ready" || !preferences) {
    const copy = getPreferencesPageCopy(state);
    const isLoading = state === "loading";
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
  }

  const status = getSubscriptionCopy(preferences.subscription);
  const isSubscribed = preferences.subscription === "subscribed";
  const isPending = preferences.subscription === "pending";

  const handleSave = async (marketing) => {
    const next = await save(marketing);
    if (next) setConfirming(false);
  };

  return (
    <div id="status_section" aria-live="polite" aria-busy={saving}>
      <h2>
        Email <span>preferences</span>
      </h2>
      <p>
        For <strong>{preferences.email}</strong>
      </p>
      <p>
        News and offers: <strong>{status.label}</strong>. {status.description}
      </p>
      {saved && <p role="status">{getSavedMessage(preferences.subscription)}</p>}
      {saveError && (
        <p className="error" role="alert">
          {getConsentErrorMessage(saveError)}
        </p>
      )}
      {isSubscribed && !confirming && (
        <CommonButton
          title={"Unsubscribe"}
          type="button"
          onClick={() => setConfirming(true)}
        />
      )}
      {isSubscribed && confirming && (
        <>
          <p>
            Stop news and offers from {STORE_NAME}? Emails about your orders
            will still reach you.
          </p>
          <CommonButton
            title={"Yes, Unsubscribe"}
            type="button"
            loading={saving}
            onClick={() => handleSave(false)}
          />
          <CommonButton
            title={"Keep Me Subscribed"}
            type="button"
            useDefaultId={false}
            className="email_consent_btn"
            disabled={saving}
            onClick={() => setConfirming(false)}
          />
        </>
      )}
      {!isSubscribed && !isPending && (
        <CommonButton
          title={"Subscribe Again"}
          type="button"
          loading={saving}
          onClick={() => handleSave(true)}
        />
      )}
      <CommonButton
        title={"Go Back to Home"}
        type="button"
        href={"/"}
        variant="light"
        useDefaultId={false}
        className="email_consent_btn"
      />
    </div>
  );
};

export default EmailPreferencesView;
