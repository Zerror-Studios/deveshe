/**
 * Cookie consent banner (PRD-014 FR-1.9, UX-05, D10)
 *
 * In-house banner on Google Consent Mode v2 (`utils/consent.util.js`). It
 * shows until the shopper answers; nothing but essential storage is used
 * before that. It also loads the store's tag ids once per page
 * (`storefrontTrackingConfig`, PRD-034 FR-1.2) and loads the tags the
 * stored choice allows, then releases the queued events. "Cookie preferences" in the footer reopens it with the
 * categories. Escape closes it only when a choice already exists.
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApolloClient } from "@apollo/client/react";
import { STOREFRONT_TRACKING_CONFIG } from "@/graphql";
import {
  CONSENT_DENIED_ALL,
  CONSENT_GRANTED_ALL,
  CONSENT_OPEN_EVENT,
  applyConsent,
  readConsent,
  saveConsent,
} from "@/utils/consent.util";
import {
  loadTagIds,
  markTrackingReady,
} from "@/utils/tracking-config.util";

const ConsentBanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [choice, setChoice] = useState(CONSENT_DENIED_ALL);
  const [hasChoice, setHasChoice] = useState(false);
  const bannerRef = useRef(null);
  const openerRef = useRef(null);
  const client = useApolloClient();
  const tagIdsRef = useRef(null);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setChoice(stored);
      setHasChoice(true);
    } else {
      setIsOpen(true);
    }

    // PRD-034 FR-1.2: the store's tag ids (env GA fallback; a failed query
    // counts as none). Tags load once they're known, with the choice
    // stored by then (also one saved while the query was in flight).
    let isActive = true;
    loadTagIds(async () => {
      const { data } = await client.query({
        query: STOREFRONT_TRACKING_CONFIG,
        fetchPolicy: "cache-first",
        context: { skipAuth: true },
      });
      return data?.storefrontTrackingConfig ?? null;
    }).then((tagIds) => {
      if (!isActive) return;
      tagIdsRef.current = tagIds;
      const latest = readConsent();
      if (latest) applyConsent(latest, tagIds);
      markTrackingReady();
    });

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
    return () => {
      isActive = false;
      window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
    };
  }, []);

  const close = () => {
    setIsOpen(false);
    setShowChoices(false);
    openerRef.current?.focus?.();
    openerRef.current = null;
  };

  const save = (nextChoice) => {
    // Before the ids load nothing is loaded here; the load applies it.
    setChoice(saveConsent(nextChoice, tagIdsRef.current || {}));
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
