/**
 * Shopping assistant speech helpers: dictation rules, transcript text,
 * microphone levels and the spoken-replies setting (DD-PRD-001
 * FR-16..FR-22)
 *
 * Pure functions with no import, so `node:test` loads them. The browser
 * parts (speech recognition, the microphone, speech synthesis) live in
 * `hooks/useDictation.jsx`. Values follow
 * the reference assistant (PRD §6.3).
 */

// ─── Dictation rules (FR-16..FR-20) ───────────────────────────────────────

/** The store's language; the reply rules read English. */
export const DICTATION_LANG = "en-IN";
/** FR-19: dictation never runs longer than this… */
export const DICTATION_MAX_MS = 180000;
/** …or this long without sound. */
export const DICTATION_SILENCE_MS = 15000;
/** Insert waits this long for the recogniser's last words. */
export const DICTATION_CONFIRM_WAIT_MS = 700;
/** FR-19: empty restarts in a row before dictation gives up. */
export const DICTATION_MAX_EMPTY_RESTARTS = 3;
/** A recognition session this short with no words counts as empty. */
export const DICTATION_EMPTY_SESSION_MS = 1000;
/** A level above this counts as sound (0..1). */
export const DICTATION_SOUND_LEVEL = 0.04;
/** FR-17: one waveform bar per this many ms. */
export const DICTATION_BAR_MS = 100;
/** FR-20: shown when the browser or the shopper refuses the microphone. */
export const DICTATION_BLOCKED_MESSAGE = "Microphone access was blocked.";

/** FR-19: `"max"` or `"silence"` when dictation should stop, else null. */
export const getDictationStopReason = ({ now, startedAt, lastSoundAt }) => {
  if (now - startedAt >= DICTATION_MAX_MS) return "max";
  if (now - lastSoundAt >= DICTATION_SILENCE_MS) return "silence";
  return null;
};

// ─── Transcript text ──────────────────────────────────────────────────────

const joinWords = (parts) =>
  parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

const extendsText = (text, previous) =>
  !!previous && text.toLowerCase().startsWith(previous.toLowerCase());

/**
 * The words of one recognition session: its final results in order, then
 * the interim tail. With `mergeRevisions` (Android Chrome repeats the
 * earlier words in each new result), a result that extends the previous
 * one replaces it.
 */
export const readRecognitionText = (
  results,
  { mergeRevisions = false } = {},
) => {
  const finals = [];
  let interim = "";
  for (let index = 0; index < (results?.length || 0); index += 1) {
    const result = results[index];
    const text = String(result?.[0]?.transcript || "").trim();
    if (!text) continue;
    if (!result.isFinal) {
      interim = joinWords([interim, text]);
      continue;
    }
    const last = finals[finals.length - 1];
    if (mergeRevisions && extendsText(text, last)) {
      finals[finals.length - 1] = text;
    } else {
      finals.push(text);
    }
  }
  const last = finals[finals.length - 1];
  if (mergeRevisions && interim && extendsText(interim, last)) {
    finals[finals.length - 1] = interim;
    interim = "";
  }
  return joinWords([...finals, interim]);
};

/** FR-18: the field's text with the dictated words after it. */
export const appendDictation = (fieldText, dictated) => {
  const words = String(dictated || "").trim();
  const current = String(fieldText || "");
  if (!words) return current;
  const trimmed = current.replace(/\s+$/, "");
  return trimmed ? `${trimmed} ${words}` : words;
};

// ─── Levels ───────────────────────────────────────────────────────────────

/** FR-17: a waveform bar's height (0..1) from the loudest level in it. */
export const getWaveBarHeight = (peak) =>
  Math.min(1, Math.pow(Math.max(0, Number(peak) || 0) * 3, 0.7));

/**
 * Eases a level towards `target` over `dtSeconds`: quickly up (`attack`,
 * seconds) and more slowly down (`release`).
 */
export const smoothLevel = (
  previous,
  target,
  dtSeconds,
  attack = 0.05,
  release = 0.25,
) => {
  const tau = target > previous ? attack : release;
  const step = 1 - Math.exp(-Math.max(0, dtSeconds) / tau);
  return previous + (target - previous) * step;
};

/** RMS level (0..1) of an analyser's time-domain bytes (128 is silence). */
export const getByteRmsLevel = (bytes, gain = 3.2) => {
  if (!bytes?.length) return 0;
  let sum = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    const value = (bytes[index] - 128) / 128;
    sum += value * value;
  }
  return Math.min(1, Math.sqrt(sum / bytes.length) * gain);
};
