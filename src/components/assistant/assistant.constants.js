/**
 * Shopping assistant: switch, routes, timings and launcher copy
 * (DD-PRD-001)
 *
 * Plain values with no JSX, shared by the launcher, the assistant and
 * `test/assistant.test.mjs`. The launcher reads only this file and the
 * painter, so the reply engine stays out of every page's first load.
 * Timings follow the reference assistant (emotion-agency.com, read on
 * 2026-11-20; PRD §6.3).
 */

// ─── Switch ───────────────────────────────────────────────────────────────

/** `false` removes the assistant from every page (PRD §9). */
export const ASSISTANT_ENABLED = true;

// ─── Routes (D2) ──────────────────────────────────────────────────────────

/** These paths, and everything under them, never show the assistant. */
export const ASSISTANT_HIDDEN_PATHS = ["/checkout", "/pay", "/orders/status"];

/** True on the checkout, payment-link and order-status pages (D2). */
export const isAssistantHiddenPath = (pathname) => {
  const path = String(pathname || "");
  return ASSISTANT_HIDDEN_PATHS.some(
    (hidden) => path === hidden || path.startsWith(`${hidden}/`),
  );
};

// ─── Motion preference (§6.1) ─────────────────────────────────────────────

/** True when the shopper asked their device for reduced motion. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ─── Launcher copy (FR-2, FR-3; the owner reviews it, Q1) ─────────────────

export const ASSISTANT_HOVER_BUBBLE =
  "I'm the DeVeSheDreams assistant. Click to chat with me.";
export const ASSISTANT_INTRO_BUBBLE =
  "Hi! Looking for a piece, delivery times or your order? Ask me.";

/** FR-3: set once the intro bubble has shown in this browser session. */
export const ASSISTANT_INTRO_SESSION_KEY = "zc_assistant_intro";

/** The dialog the launcher opens (`aria-controls`). */
export const ASSISTANT_DIALOG_ID = "assistant_dialog";

// ─── Analytics (FR-26) ────────────────────────────────────────────────────

export const ASSISTANT_LIST_ID = "assistant";
export const ASSISTANT_LIST_NAME = "Shopping assistant";

// ─── Timings ──────────────────────────────────────────────────────────────

/** FR-6: the ripple that opens the assistant. */
export const ASSISTANT_OPEN_MS = 1100;
/** FR-7: the ripple that closes it. */
export const ASSISTANT_CLOSE_MS = 900;
/** FR-6: the content starts fading in this long after the click… */
export const ASSISTANT_CONTENT_DELAY_MS = 650;
/** …and fades in, or out on close, over this long. */
export const ASSISTANT_CONTENT_FADE_MS = 450;
/** §6.1: opening and closing with reduced motion. */
export const ASSISTANT_REDUCED_FADE_MS = 250;
/** FR-3: the intro bubble waits this long after the page's `load`… */
export const ASSISTANT_INTRO_DELAY_MS = 5000;
/** …and shows for this long. */
export const ASSISTANT_INTRO_SHOW_MS = 5000;
/** FR-11: the orb sleeps after this long without activity. */
export const ASSISTANT_SLEEP_MS = 45000;
/** FR-12: the shortest wait before a reply, so it reads as an answer. */
export const ASSISTANT_REPLY_DELAY_MS = 420;
/** FR-8: closing waits this long for the Back step before closing anyway. */
export const ASSISTANT_HISTORY_FALLBACK_MS = 400;
/** A navigation reply is read for this long before the assistant leaves. */
export const ASSISTANT_NAVIGATE_DELAY_MS = 700;
