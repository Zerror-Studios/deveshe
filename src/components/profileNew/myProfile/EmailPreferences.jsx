/**
 * Email preferences (backend PRD-050 FR-3.6, FR-3.8; was PRD-014 FR-2.8)
 *
 * One real choice, the shopper's marketing-email consent, read with the
 * kit's `useMyEmailPreferences` (`myEmailPreferences`: subscribed, waiting
 * for the confirmation click, or not) and saved with
 * `updateMyEmailPreferences`, which records the version of the wording
 * shown here. The box is never ticked for the shopper; ticking it starts
 * double opt-in (a confirmation email), unticking it stops news and offers
 * only (order emails keep coming).
 *
 * Keep in sync with
 * `storefronts/rare-element/src/components/account/settings/EmailPreference.jsx`.
 */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useMyEmailPreferences } from "@zcom/storefront-kit/client";

import CommonButton from "@/components/common/CommonButton";
import {
  EMAIL_CONFIRMATION_HINT,
  EMAIL_CONSENT_LABEL,
  EMAIL_NOTICE_VERSION,
  getConsentErrorMessage,
  getSavedMessage,
  getSubscriptionCopy,
} from "@/utils/email-consent.util";

// ─── Component ────────────────────────────────────────────────────────────

const EmailPreferences = () => {
  const {
    preferences,
    loading,
    error,
    save,
    saving,
    saveError,
    retryAfterMs,
    reload,
  } = useMyEmailPreferences({ noticeVersion: EMAIL_NOTICE_VERSION });
  const subscription = preferences?.subscription ?? null;
  // A pending sign-up counts as "yes" until the shopper unticks it.
  const isOptedIn = subscription === "subscribed" || subscription === "pending";
  const [wantsEmail, setWantsEmail] = useState(isOptedIn);
  const status = subscription ? getSubscriptionCopy(subscription) : null;

  useEffect(() => {
    setWantsEmail(isOptedIn);
  }, [isOptedIn]);

  const handleSave = async () => {
    if (saving || !preferences || wantsEmail === isOptedIn) return;
    const next = await save(wantsEmail);
    // A failed save shows `saveError` under the box
    if (next) toast.success(getSavedMessage(next.subscription));
  };

  return (
    <div id="email_preferences" className="detail_block">
      <div className="profile_left_container">
        <h4>Email Preferences</h4>
        <p>
          Choose whether we may email you news and offers. You can change this
          at any time, and every email has an unsubscribe link.
        </p>
      </div>
      <div className="profile_right_container">
        <p aria-live="polite">
          {status
            ? `${status.label}. ${status.description}`
            : loading
              ? "Loading your preference…"
              : ""}
        </p>
        <label className="checkbox_container" htmlFor="email_pref_marketing">
          <input
            id="email_pref_marketing"
            type="checkbox"
            checked={wantsEmail}
            disabled={!preferences || saving}
            onChange={(event) => setWantsEmail(event.target.checked)}
            aria-describedby="email_pref_hint"
          />
          <p>{EMAIL_CONSENT_LABEL}</p>
        </label>
        <p id="email_pref_hint">{EMAIL_CONFIRMATION_HINT}</p>
        {saveError && (
          <p className="error" role="alert">
            {getConsentErrorMessage(saveError, retryAfterMs)}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {getConsentErrorMessage(error)}{" "}
            {error !== "no_email" && (
              <button type="button" className="underline" onClick={reload}>
                Try again
              </button>
            )}
          </p>
        )}
        <CommonButton
          type="button"
          title="Update My Preferences"
          onClick={handleSave}
          loading={saving}
          disabled={!preferences || wantsEmail === isOptedIn}
        />
      </div>
    </div>
  );
};

export default EmailPreferences;
