"use client";

/**
 * Shopping assistant launcher (DD-PRD-001 FR-1..FR-5)
 *
 * The gradient button and its bubble, bottom right on every page except
 * checkout, payment links and order status (D2). The canvas starts after
 * the page's `load` (it never competes with the first paint) and pauses
 * while the assistant is open. The button stays in the corner (D7), and
 * only rises above the product page's add-to-bag bar on phones, so it
 * never covers the buy button. The assistant itself
 * (`AssistantOverlay`) is a lazy chunk, fetched on the first hover, focus
 * or click, so it adds nothing to a page's first load.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import AssistantBubble from "@/components/assistant/AssistantBubble";
import {
  ASSISTANT_DIALOG_ID,
  ASSISTANT_ENABLED,
  ASSISTANT_HOVER_BUBBLE,
  ASSISTANT_INTRO_BUBBLE,
  ASSISTANT_INTRO_DELAY_MS,
  ASSISTANT_INTRO_SESSION_KEY,
  ASSISTANT_INTRO_SHOW_MS,
  isAssistantHiddenPath,
  prefersReducedMotion,
} from "@/components/assistant/assistant.constants";
import { useAssistantStore } from "@/store/assistant-store";
import { paintAssistantGradient } from "@/utils/assistant-gradient.util";

// ─── Constants ────────────────────────────────────────────────────────────

const loadAssistant = () => import("@/components/assistant/AssistantOverlay");
const AssistantOverlay = dynamic(loadAssistant, { ssr: false });

/**
 * FR-5: page parts the button rises above, with this gap. Only the phone
 * add-to-bag bar: everywhere else it stays in the corner (D7, owner
 * 2026-11-20), the footer included.
 */
const AVOID_SELECTORS = [".mobile_add_btn"];
const AVOID_GAP_PX = 12;
/** Late content (the product page's bar) is measured again after this. */
const REMEASURE_MS = 600;

// ─── Helpers ──────────────────────────────────────────────────────────────

const readIntroShown = () => {
  try {
    return window.sessionStorage.getItem(ASSISTANT_INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

const writeIntroShown = () => {
  try {
    window.sessionStorage.setItem(ASSISTANT_INTRO_SESSION_KEY, "1");
  } catch {
    // No storage: the bubble shows once per page load instead
  }
};

/** Runs `callback` once the page has loaded and the browser is idle. */
const afterPageLoad = (callback) => {
  let idleId = null;
  let timerId = null;
  const run = () => {
    if (window.requestIdleCallback) {
      idleId = window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      timerId = window.setTimeout(callback, 200);
    }
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.removeEventListener("load", run);
    if (idleId !== null) window.cancelIdleCallback?.(idleId);
    window.clearTimeout(timerId);
  };
};

// ─── Component ────────────────────────────────────────────────────────────

const AssistantLauncher = () => {
  const pathname = usePathname();
  const hidden = !ASSISTANT_ENABLED || isAssistantHiddenPath(pathname);
  const isOpen = useAssistantStore((state) => state.isOpen);
  const hasOpened = useAssistantStore((state) => state.hasOpened);

  const [mountAssistant, setMountAssistant] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [intro, setIntro] = useState(false);
  const [lastBubble, setLastBubble] = useState("");
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);
  const pausedRef = useRef(false);

  const bubble = hovered
    ? ASSISTANT_HOVER_BUBBLE
    : intro
      ? ASSISTANT_INTRO_BUBBLE
      : "";

  // The bubble keeps its last words while it fades out
  useEffect(() => {
    if (bubble) setLastBubble(bubble);
  }, [bubble]);

  // D2: a page that hides the assistant closes it
  useEffect(() => {
    if (hidden && isOpen) useAssistantStore.getState().close();
  }, [hidden, isOpen]);

  useEffect(() => {
    pausedRef.current = isOpen;
  }, [isOpen]);

  // ─── Gradient (FR-1) ───────────────────────────────────────────────────

  useEffect(() => {
    if (hidden) return undefined;
    const canvas = canvasRef.current;
    const holder = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !holder) return undefined;

    const startedAt = performance.now();
    const now = () => (performance.now() - startedAt) / 1000 + 1.5;
    let size = 0;
    let skip = false;
    let running = false;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      size = holder.clientWidth;
      canvas.width = Math.round(size * scale);
      canvas.height = Math.round(size * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const paint = () => paintAssistantGradient(ctx, size, size, now());
    // Half the frame rate, and nothing while the assistant covers it
    const tick = () => {
      skip = !skip;
      if (skip || pausedRef.current) return;
      paint();
    };

    const observer = new ResizeObserver(() => {
      resize();
      paint();
    });
    observer.observe(holder);
    resize();
    paint();
    const cancelWait = afterPageLoad(() => {
      if (prefersReducedMotion()) return;
      running = true;
      gsap.ticker.add(tick);
    });
    return () => {
      cancelWait();
      if (running) gsap.ticker.remove(tick);
      observer.disconnect();
    };
  }, [hidden]);

  // ─── Intro bubble (FR-3) ───────────────────────────────────────────────

  useEffect(() => {
    if (hidden || hasOpened || readIntroShown()) return undefined;
    let showTimer = null;
    let hideTimer = null;
    const cancelWait = afterPageLoad(() => {
      showTimer = window.setTimeout(() => {
        if (useAssistantStore.getState().hasOpened || readIntroShown()) return;
        writeIntroShown();
        setIntro(true);
        hideTimer = window.setTimeout(
          () => setIntro(false),
          ASSISTANT_INTRO_SHOW_MS,
        );
      }, ASSISTANT_INTRO_DELAY_MS);
    });
    return () => {
      cancelWait();
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [hidden, hasOpened]);

  // ─── Rising above the phone add-to-bag bar (FR-5) ──────────────────────

  useEffect(() => {
    if (hidden) return undefined;
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;
    let frame = null;

    const measure = () => {
      frame = null;
      const bottom = parseFloat(getComputedStyle(wrapper).bottom) || 0;
      const naturalBottom = window.innerHeight - bottom;
      const naturalTop = naturalBottom - wrapper.offsetHeight;
      const left = wrapper.offsetLeft;
      const right = left + wrapper.offsetWidth;
      let lift = 0;
      for (const selector of AVOID_SELECTORS) {
        for (const element of document.querySelectorAll(selector)) {
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const acrossButton = rect.left < right && rect.right > left;
          const underButton =
            rect.top < naturalBottom &&
            rect.bottom > naturalTop - AVOID_GAP_PX;
          if (acrossButton && underButton) {
            lift = Math.max(lift, naturalBottom - rect.top + AVOID_GAP_PX);
          }
        }
      }
      wrapper.style.transform =
        lift > 0 ? `translate3d(0, ${-Math.round(lift)}px, 0)` : "";
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    const remeasure = window.setTimeout(schedule, REMEASURE_MS);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.clearTimeout(remeasure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [hidden, pathname]);

  // ─── Opening ───────────────────────────────────────────────────────────

  const prefetch = useCallback(() => {
    loadAssistant().catch(() => {});
  }, []);

  const handleClick = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : null;
    setHovered(false);
    setIntro(false);
    writeIntroShown();
    setMountAssistant(true);
    useAssistantStore.getState().open(origin);
  };

  if (hidden) return null;

  return (
    <>
      <div ref={wrapperRef} className="assistant_launcher">
        <AssistantBubble
          text={bubble || lastBubble}
          visible={!!bubble && !isOpen}
        />
        <button
          ref={buttonRef}
          type="button"
          className="assistant_launcher_btn"
          aria-label="Open the shopping assistant"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={mountAssistant ? ASSISTANT_DIALOG_ID : undefined}
          onClick={handleClick}
          onPointerEnter={(event) => {
            prefetch();
            if (event.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          onFocus={(event) => {
            prefetch();
            // Keyboard focus shows the bubble too (older Safari lacks the selector)
            try {
              if (event.currentTarget.matches(":focus-visible")) setHovered(true);
            } catch {
              // no bubble on focus there
            }
          }}
          onBlur={() => setHovered(false)}
        >
          <span className="assistant_launcher_glow" aria-hidden="true" />
          <span className="assistant_launcher_canvas" aria-hidden="true">
            <canvas ref={canvasRef} />
          </span>
        </button>
      </div>
      {mountAssistant && <AssistantOverlay />}
    </>
  );
};

export default AssistantLauncher;
