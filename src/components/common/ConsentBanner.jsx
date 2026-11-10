"use client";

/**
 * Cookie consent banner (PRD-014 FR-1.9, UX-05, D10)
 *
 * The store's banner on the kit's consent (kit PRD-002 FR-4.1): it shows
 * until the shopper answers; nothing but essential storage is used before
 * that. "Cookie preferences" in the footer reopens it with the categories
 * (`openConsentPreferences`). Escape closes it only when a choice already
 * exists. Saving calls the kit's `updateConsent`, which updates Consent
 * Mode, keeps or drops the attribution and click ids, and makes `ZcomTags`
 * load what the choice allows (the tag ids come from
 * `storefrontTrackingConfig`, PRD-034 FR-1.2). "marketing" here is the
 * kit's "ads" consent.
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_OPEN_EVENT,
  getStoredConsent,
  updateConsent,
} from "@zcom/storefront-kit/core";

// ─── Consent ──────────────────────────────────────────────────────────────

const CONSENT_DENIED_ALL = Object.freeze({ analytics: false, marketing: false });
const CONSENT_GRANTED_ALL = Object.freeze({ analytics: true, marketing: true });

/** The kit's stored choice as the banner's two switches, or null. */
const readConsent = () => {
  const stored = getStoredConsent();
  return stored
    ? {
        analytics: stored.analytics === "granted",
        marketing: stored.ads === "granted",
      }
    : null;
};

const saveConsent = (choice) => {
  updateConsent({
    analytics: choice.analytics ? "granted" : "denied",
    ads: choice.marketing ? "granted" : "denied",
  });
  return { analytics: !!choice.analytics, marketing: !!choice.marketing };
};

// ─── Component ────────────────────────────────────────────────────────────

const ConsentBanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [choice, setChoice] = useState(CONSENT_DENIED_ALL);
  const [hasChoice, setHasChoice] = useState(false);
  const bannerRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setChoice(stored);
      setHasChoice(true);
    } else {
      setIsOpen(true);
    }

    const handleOpen = () => {
      openerRef.current = document.activeElement;
      setChoice(readConsent() || CONSENT_DENIED_ALL);
      setShowChoices(true);
      setIsOpen(true);
      requestAnimationFrame(() => {
        bannerRef.current?.querySelector("input, button")?.focus();
      });
    };
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  const close = () => {
    setIsOpen(false);
    setShowChoices(false);
    openerRef.current?.focus?.();
    openerRef.current = null;
  };

  const save = (nextChoice) => {
    // Before the ids load nothing is loaded here; the load applies it.
    setChoice(saveConsent(nextChoice));
    setHasChoice(true);
    close();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && hasChoice) close();
  };

  const toggle = (category) => (event) =>
    setChoice((prev) => ({ ...prev, [category]: event.target.checked }));

  if (!isOpen) return null;

  return (
    <section
      ref={bannerRef}
      className="consent_banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent_banner_title"
      aria-describedby="consent_banner_text"
      onKeyDown={handleKeyDown}
      data-lenis-prevent
    >
      <p id="consent_banner_title" className="consent_banner_title">
        Cookies on DeVeSheDreams
      </p>
      <p id="consent_banner_text">
        We use essential cookies to run the store. With your permission we
        also use analytics cookies (Google Analytics) to understand how the
        site is used, and marketing cookies (Google Ads and the Meta Pixel)
        to measure our ads.
        You can change this at any time from &ldquo;Cookie preferences&rdquo;
        in the footer. Read our{" "}
        <Link href="/privacy-policy">
          privacy policy
        </Link>
        .
      </p>

      {showChoices && (
        <fieldset className="consent_banner_choices">
          <legend>Choose cookies</legend>
          <label>
            <input type="checkbox" checked disabled />
            Essential (always on)
          </label>
          <label>
            <input
              type="checkbox"
              checked={choice.analytics}
              onChange={toggle("analytics")}
            />
            Analytics
          </label>
          <label>
            <input
              type="checkbox"
              checked={choice.marketing}
              onChange={toggle("marketing")}
            />
            Marketing
          </label>
        </fieldset>
      )}

      <div className="consent_banner_actions">
        <button
          type="button"
          className="consent_banner_btn"
          onClick={() => save(CONSENT_DENIED_ALL)}
        >
          Reject all
        </button>
        {showChoices ? (
          <button
            type="button"
            className="consent_banner_btn"
            onClick={() => save(choice)}
          >
            Save choices
          </button>
        ) : (
          <button
            type="button"
            className="consent_banner_btn"
            onClick={() => setShowChoices(true)}
          >
            Manage
          </button>
        )}
        <button
          type="button"
          className="consent_banner_btn consent_banner_btn_primary"
          onClick={() => save(CONSENT_GRANTED_ALL)}
        >
          Accept all
        </button>
      </div>
    </section>
  );
};

export default ConsentBanner;
