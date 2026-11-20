"use client";

/**
 * The glow that turns around the screen's edges while the shopper dictates
 * (DD-PRD-001 FR-17): a 3 px conic border and a 56 px inner glow, one turn
 * every 12 s, fading in over .6 s and out over .45 s. All CSS
 * (`assistant.css`); paused while hidden.
 */

import React from "react";

const DictationGlow = ({ visible }) => (
  <div
    className={`assistant_glow${visible ? " is-visible" : ""}`}
    aria-hidden="true"
  />
);

export default DictationGlow;
