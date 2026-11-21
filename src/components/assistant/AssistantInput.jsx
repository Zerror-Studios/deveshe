"use client";

/**
 * The assistant's input (DD-PRD-001 FR-14, FR-17, FR-18)
 *
 * A pill whose thin ring turns once every 8 s and, on hover or focus,
 * eases to rest at 70° (`getRingRest`), then resumes from where it stopped.
 * Inside: the mic button (when dictation is supported), a field that grows
 * to 6 lines (past one line the buttons move under the text) and the send
 * button, which becomes Stop while a reply is in progress. While the
 * shopper dictates, the row becomes the waveform with Cancel and Insert;
 * Insert puts the words after the field's text without sending them.
 *
 * `ref` gives `focus()`, `insert(text)` and, for "Talk to us" (backend
 * PRD-049 B0.1), `getValue()` and `clear()`.
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FiArrowUpRight, FiCheck, FiMic, FiSquare, FiX } from "react-icons/fi";
import DictationWave from "@/components/assistant/DictationWave";
import { prefersReducedMotion } from "@/components/assistant/assistant.constants";
import { appendDictation } from "@/utils/assistant-dictation.util";
import {
  getRingRest,
  getRingResumeDelay,
} from "@/utils/assistant-gradient.util";

// ─── Constants ────────────────────────────────────────────────────────────

const MAX_LINES = 6;
const MAX_MESSAGE_LENGTH = 2000;

const readRingAngle = (element) =>
  parseFloat(
    getComputedStyle(element).getPropertyValue("--assistant-ring-angle"),
  ) || 0;

// ─── Component ────────────────────────────────────────────────────────────

const AssistantInput = forwardRef(function AssistantInput(
  { canInterrupt, onSubmit, onInterrupt, onDictate, onActivity, dictation },
  ref,
) {
  const [value, setValue] = useState("");
  const [multiline, setMultiline] = useState(false);
  const formRef = useRef(null);
  const textareaRef = useRef(null);
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const settlingRef = useRef(false);
  const multilineAtRef = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus({ preventScroll: true }),
      insert: (text) => {
        setValue((current) =>
          appendDictation(current, text).slice(0, MAX_MESSAGE_LENGTH),
        );
        requestAnimationFrame(() =>
          textareaRef.current?.focus({ preventScroll: true }),
        );
      },
      getValue: () => textareaRef.current?.value ?? "",
      clear: () => setValue(""),
    }),
    [],
  );

  // FR-14: grows to 6 lines; past one line the buttons move under it (kept
  // until the text is clearly shorter, so the layout doesn't flicker)
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const style = getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight) || 22;
    const padding =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    const maxHeight = lineHeight * MAX_LINES + padding;
    textarea.style.height = "auto";
    const contentHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(contentHeight, maxHeight)}px`;
    textarea.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";

    // Lines counted, not pixels compared: display scaling (125 %, 150 %)
    // adds a fraction of a pixel that must not count as a second line
    const lines = Math.round((contentHeight - padding) / lineHeight);
    const wraps = value.includes("\n") || lines >= 2;
    if (!multiline && wraps) {
      multilineAtRef.current = value.length;
      setMultiline(true);
    } else if (
      multiline &&
      !value.includes("\n") &&
      value.length < multilineAtRef.current - 2
    ) {
      setMultiline(false);
    }
  }, [value, multiline, dictation.isDictating]);

  // ─── Ring (FR-14) ──────────────────────────────────────────────────────

  const settleRing = () => {
    const form = formRef.current;
    if (!form || settlingRef.current || prefersReducedMotion()) return;
    settlingRef.current = true;
    const angle = readRingAngle(form);
    const { target, duration } = getRingRest(angle);
    form.style.setProperty("--assistant-ring-angle", `${angle}deg`);
    form.classList.add("is-settling");
    requestAnimationFrame(() => {
      if (!settlingRef.current) return;
      form.style.transitionDuration = `${duration}s`;
      form.style.setProperty("--assistant-ring-angle", `${target}deg`);
    });
  };

  const resumeRing = () => {
    const form = formRef.current;
    if (!form || !settlingRef.current) return;
    settlingRef.current = false;
    const angle = readRingAngle(form);
    form.classList.remove("is-settling");
    form.style.transitionDuration = "";
    form.style.removeProperty("--assistant-ring-angle");
    form.style.animationDelay = `${getRingResumeDelay(angle)}s`;
  };

  const handlePointerEnter = () => {
    hoveredRef.current = true;
    settleRing();
  };
  const handlePointerLeave = () => {
    hoveredRef.current = false;
    if (!focusedRef.current) resumeRing();
  };
  const handleFocus = () => {
    focusedRef.current = true;
    settleRing();
  };
  const handleBlur = (event) => {
    if (formRef.current?.contains(event.relatedTarget)) return;
    focusedRef.current = false;
    if (!hoveredRef.current) resumeRing();
  };

  // ─── Sending ───────────────────────────────────────────────────────────

  const submit = () => {
    const text = value.trim();
    if (!text || canInterrupt) return;
    onSubmit(text);
    setValue("");
  };

  const handleKeyDown = (event) => {
    onActivity?.();
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      ref={formRef}
      className="assistant_input"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {dictation.isDictating ? (
        <div className="assistant_dictation">
          <DictationWave getLevel={dictation.getLevel} />
          <button
            type="button"
            className="assistant_round_btn is-ghost"
            aria-label="Cancel dictation"
            onClick={dictation.cancel}
          >
            <FiX aria-hidden="true" />
          </button>
          <button
            type="button"
            className="assistant_round_btn is-primary"
            aria-label="Insert dictation"
            onClick={dictation.confirm}
          >
            <FiCheck aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          {dictation.supported && (
            <button
              type="button"
              className="assistant_round_btn is-ghost assistant_mic"
              aria-label="Dictate a message"
              onClick={onDictate}
            >
              <FiMic aria-hidden="true" />
            </button>
          )}
          <textarea
            ref={textareaRef}
            className="assistant_textarea"
            rows={1}
            value={value}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Ask me anything…"
            aria-label="Message the shopping assistant"
            autoComplete="off"
            data-multiline={multiline ? "" : undefined}
            onChange={(event) => {
              setValue(event.target.value);
              onActivity?.();
            }}
            onKeyDown={handleKeyDown}
          />
          {canInterrupt ? (
            <button
              type="button"
              className="assistant_round_btn is-primary assistant_send"
              aria-label="Stop the reply"
              onClick={onInterrupt}
            >
              <FiSquare aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="assistant_round_btn is-primary assistant_send"
              aria-label="Send message"
              disabled={!value.trim()}
            >
              <FiArrowUpRight aria-hidden="true" />
            </button>
          )}
        </>
      )}
    </form>
  );
});

export default AssistantInput;
