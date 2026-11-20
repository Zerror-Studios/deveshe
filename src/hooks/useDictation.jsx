"use client";

/**
 * Dictation for the shopping assistant (DD-PRD-001 FR-16..FR-21)
 *
 * The browser's own speech recognition (continuous, interim results,
 * `en-IN`) plus a microphone level meter for the waveform and the orb.
 * On Android the recogniser and the meter can't share the microphone, so
 * the level follows the recogniser's events instead (as the reference
 * assistant does). Safari keeps one utterance open, so it is stopped after
 * each final result and restarted.
 *
 * `onConfirm(text)` gets the words on Insert (or when dictation stops by
 * itself after 15 s of silence or 3 minutes); Cancel drops them. When the
 * browser or the shopper refuses the microphone, `onError` gets the message
 * and the mic button hides until the page reloads. The page's permissions
 * policy must allow the microphone (the kit's header option, FR-21); until
 * it does, `supported` stays false and nothing is asked.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  DICTATION_BLOCKED_MESSAGE,
  DICTATION_CONFIRM_WAIT_MS,
  DICTATION_EMPTY_SESSION_MS,
  DICTATION_LANG,
  DICTATION_MAX_EMPTY_RESTARTS,
  DICTATION_SOUND_LEVEL,
  getByteRmsLevel,
  getDictationStopReason,
  readRecognitionText,
  smoothLevel,
} from "@/utils/assistant-dictation.util";

// ─── Support ──────────────────────────────────────────────────────────────

/** Set when the microphone was refused: no mic button until a reload. */
let microphoneBlocked = false;

const getRecognitionClass = () =>
  typeof window === "undefined"
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

/** False when the page's Permissions-Policy blocks the microphone. */
const isMicrophoneAllowed = () => {
  const policy = document.permissionsPolicy || document.featurePolicy;
  if (!policy || typeof policy.allowsFeature !== "function") return true;
  try {
    return policy.allowsFeature("microphone");
  } catch {
    return true;
  }
};

/** FR-20: speech recognition exists and the microphone may be used. */
export const isDictationSupported = () =>
  !microphoneBlocked && !!getRecognitionClass() && isMicrophoneAllowed();

const isAndroid = () => /android/i.test(navigator.userAgent || "");
const isAppleBrowser = () => /apple/i.test(navigator.vendor || "");

const hasFinalResult = (event) => {
  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    if (event.results[index]?.isFinal) return true;
  }
  return false;
};

// ─── Level meters ─────────────────────────────────────────────────────────

/** The microphone's level from an analyser, smoothed every frame. */
function createMicrophoneMeter(onLevel) {
  let stream = null;
  let context = null;
  let source = null;
  let analyser = null;
  let bytes = null;
  let level = 0;
  let lastTime = 0;
  let stopped = false;

  const tick = () => {
    if (!analyser) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    analyser.getByteTimeDomainData(bytes);
    level = smoothLevel(level, getByteRmsLevel(bytes), dt);
    onLevel(level);
  };

  return {
    async start() {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (stopped) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = media;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      context = new AudioContextClass();
      if (context.state === "suspended") context.resume().catch(() => {});
      source = context.createMediaStreamSource(stream);
      analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      bytes = new Uint8Array(analyser.fftSize);
      lastTime = performance.now();
      gsap.ticker.add(tick);
    },
    kick() {},
    stop() {
      stopped = true;
      gsap.ticker.remove(tick);
      try {
        source?.disconnect();
      } catch {
        // already disconnected
      }
      stream?.getTracks().forEach((track) => track.stop());
      context?.close().catch(() => {});
      stream = context = source = analyser = null;
      onLevel(0);
    },
  };
}

/** Android: a level that rises on the recogniser's events and decays. */
function createEventMeter(onLevel) {
  let energy = 0;
  let level = 0;
  let lastTime = 0;

  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    energy *= Math.exp(-dt / 0.35);
    level = smoothLevel(level, energy > 0.05 ? 0.06 + 0.24 * energy : 0, dt);
    onLevel(level);
  };

  return {
    async start() {
      lastTime = performance.now();
      gsap.ticker.add(tick);
    },
    kick(amount = 0.6 + 0.4 * Math.random()) {
      energy = Math.max(energy, amount);
    },
    stop() {
      gsap.ticker.remove(tick);
      energy = 0;
      level = 0;
      onLevel(0);
    },
  };
}

// ─── Controller ───────────────────────────────────────────────────────────

/** One dictation at a time; state lives here, not in React. */
function createDictationController({ getOptions, setDictating, setSupported }) {
  let session = null;
  let level = 0;

  const emitLevel = (value) => {
    level = value;
    if (session && value > DICTATION_SOUND_LEVEL) {
      session.lastSoundAt = performance.now();
    }
    getOptions().onLevel?.(value);
  };

  const commitSessionText = (current) => {
    const words = current.sessionText.trim();
    if (words) {
      current.committed = current.committed
        ? `${current.committed} ${words}`
        : words;
    }
    current.sessionText = "";
  };

  const teardown = () => {
    const current = session;
    if (!current) return;
    session = null;
    clearInterval(current.checkTimer);
    clearTimeout(current.confirmTimer);
    clearTimeout(current.restartTimer);
    const recognition = current.recognition;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onsoundstart = null;
      try {
        recognition.abort();
      } catch {
        // already ended
      }
    }
    current.meter?.stop();
    level = 0;
    setDictating(false);
  };

  const finish = () => {
    const current = session;
    if (!current) return;
    commitSessionText(current);
    const text = current.committed.trim();
    teardown();
    if (text) getOptions().onConfirm?.(text);
  };

  const confirm = () => {
    const current = session;
    if (!current || current.confirming) return;
    current.confirming = true;
    clearTimeout(current.restartTimer);
    current.confirmTimer = setTimeout(finish, DICTATION_CONFIRM_WAIT_MS);
    if (!current.recognition) {
      finish();
      return;
    }
    try {
      current.recognition.stop();
    } catch {
      finish();
    }
  };

  const refuse = () => {
    microphoneBlocked = true;
    teardown();
    setSupported(false);
    getOptions().onError?.(DICTATION_BLOCKED_MESSAGE);
  };

  const listen = (current, isRetry = false) => {
    if (session !== current) return;
    const Recognition = getRecognitionClass();
    if (!Recognition) {
      confirm();
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = DICTATION_LANG;
    current.recognition = recognition;
    current.sessionText = "";
    current.sessionStartedAt = performance.now();

    recognition.onsoundstart = () => {
      current.lastSoundAt = performance.now();
      current.meter?.kick(0.4);
    };
    recognition.onresult = (event) => {
      current.sessionText = readRecognitionText(event.results, {
        mergeRevisions: current.android,
      });
      current.lastSoundAt = performance.now();
      current.meter?.kick();
      if (current.apple && !current.confirming && hasFinalResult(event)) {
        setTimeout(() => {
          try {
            recognition.stop();
          } catch {
            // already ended
          }
        }, 0);
      }
    };
    recognition.onerror = (event) => {
      const error = event?.error || "";
      // Android may refuse the first start while the page takes the mic
      if (current.android && !isRetry && error === "not-allowed") {
        current.retryAfterEnd = true;
        return;
      }
      if (error === "not-allowed" || error === "service-not-allowed") {
        refuse();
        return;
      }
      if (error === "network" || error === "audio-capture") confirm();
    };
    recognition.onend = () => {
      if (session !== current) return;
      if (current.confirming) {
        finish();
        return;
      }
      if (current.retryAfterEnd) {
        current.retryAfterEnd = false;
        commitSessionText(current);
        current.restartTimer = setTimeout(() => listen(current, true), 250);
        return;
      }
      const wasEmpty =
        !current.sessionText.trim() &&
        performance.now() - current.sessionStartedAt <
          DICTATION_EMPTY_SESSION_MS;
      commitSessionText(current);
      current.emptyRestarts = wasEmpty ? current.emptyRestarts + 1 : 0;
      if (current.emptyRestarts >= DICTATION_MAX_EMPTY_RESTARTS) {
        finish();
        return;
      }
      listen(current);
    };

    try {
      recognition.start();
    } catch {
      if (isRetry) {
        finish();
        return;
      }
      current.restartTimer = setTimeout(() => listen(current, true), 250);
    }
  };

  const start = () => {
    if (session || !isDictationSupported()) return;
    const now = performance.now();
    const android = isAndroid();
    const current = {
      committed: "",
      sessionText: "",
      startedAt: now,
      lastSoundAt: now,
      sessionStartedAt: now,
      emptyRestarts: 0,
      confirming: false,
      retryAfterEnd: false,
      android,
      apple: isAppleBrowser(),
      recognition: null,
      meter: android
        ? createEventMeter(emitLevel)
        : createMicrophoneMeter(emitLevel),
    };
    session = current;
    setDictating(true);
    listen(current);
    // The level is decoration: the words come from the recogniser
    current.meter.start().catch(() => {});
    current.checkTimer = setInterval(() => {
      const reason = getDictationStopReason({
        now: performance.now(),
        startedAt: current.startedAt,
        lastSoundAt: current.lastSoundAt,
      });
      if (reason) confirm();
    }, 1000);
  };

  return {
    start,
    confirm,
    cancel: teardown,
    getLevel: () => level,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * `{ supported, isDictating, start, confirm, cancel, getLevel }`.
 * Options: `onConfirm(text)`, `onError(message)`, `onLevel(level)`.
 */
export function useDictation(options = {}) {
  const [supported, setSupported] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const optionsRef = useRef(options);
  const controllerRef = useRef(null);

  useEffect(() => {
    optionsRef.current = options;
  });

  if (!controllerRef.current) {
    controllerRef.current = createDictationController({
      getOptions: () => optionsRef.current,
      setDictating: setIsDictating,
      setSupported,
    });
  }

  useEffect(() => {
    setSupported(isDictationSupported());
    const controller = controllerRef.current;
    return () => controller.cancel();
  }, []);

  const start = useCallback(() => controllerRef.current.start(), []);
  const confirm = useCallback(() => controllerRef.current.confirm(), []);
  const cancel = useCallback(() => controllerRef.current.cancel(), []);
  const getLevel = useCallback(() => controllerRef.current.getLevel(), []);

  return { supported, isDictating, start, confirm, cancel, getLevel };
}
