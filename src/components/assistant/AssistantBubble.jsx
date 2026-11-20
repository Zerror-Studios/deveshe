"use client";

/**
 * The launcher's speech bubble (DD-PRD-001 FR-2..FR-4): red with a slowly
 * morphing gradient, its text decoding in through GSAP's ScrambleTextPlugin.
 * The plugin loads once the page is idle after `load`, so it stays out of
 * the first load; until it arrives the text simply appears. A hidden copy
 * of the text sizes the bubble, so it doesn't grow as the letters arrive.
 * Decorative: the launcher button carries the label.
 */

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/components/assistant/assistant.constants";

// ─── Plugin ───────────────────────────────────────────────────────────────

let scramblePlugin = null;
let scrambleLoad = null;

const loadScramblePlugin = () => {
  if (!scrambleLoad) {
    scrambleLoad = import("gsap/dist/ScrambleTextPlugin").then((module) => {
      scramblePlugin = module.ScrambleTextPlugin || module.default;
      gsap.registerPlugin(scramblePlugin);
      return scramblePlugin;
    });
  }
  return scrambleLoad;
};

// ─── Component ────────────────────────────────────────────────────────────

const AssistantBubble = ({ text, visible }) => {
  const textRef = useRef(null);

  // Fetch the plugin when the page is idle, before the bubble first shows
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let idleId = null;
    const preload = () => {
      const load = () => loadScramblePlugin().catch(() => {});
      if (window.requestIdleCallback) idleId = window.requestIdleCallback(load);
      else load();
    };
    if (document.readyState === "complete") preload();
    else window.addEventListener("load", preload, { once: true });
    return () => {
      window.removeEventListener("load", preload);
      if (idleId !== null) window.cancelIdleCallback?.(idleId);
    };
  }, []);

  useEffect(() => {
    const element = textRef.current;
    if (!element || !visible || !text) return undefined;
    if (!scramblePlugin || prefersReducedMotion()) {
      element.textContent = text;
      return undefined;
    }
    element.textContent = "";
    const tween = gsap.to(element, {
      duration: 0.5,
      ease: "none",
      scrambleText: { text, chars: "upperCase", speed: 0.6 },
    });
    return () => tween.kill();
  }, [text, visible]);

  return (
    <div
      className={`assistant_bubble${visible ? " is-visible" : ""}`}
      aria-hidden="true"
    >
      <span className="assistant_bubble_gradient" />
      <p className="assistant_bubble_text">
        <span className="assistant_bubble_sizer">{text}</span>
        <span ref={textRef} className="assistant_bubble_live" />
      </p>
    </div>
  );
};

export default AssistantBubble;
