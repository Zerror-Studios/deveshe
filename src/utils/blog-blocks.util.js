/**
 * Blog block helpers (backend PRD-047 FR-8, FR-9, FR-11, D4, D5): the poll's
 * voter cookie, "already voted" memory and results bars, and the posts a
 * related-posts block shows.
 *
 * One vote per browser: a random id in the `zc_poll_voter` cookie (one
 * year, `SameSite=Lax`, `Secure` on https), which the backend keeps only as
 * a keyed hash. Votes go through the kit's same-origin `/v1/graphql` proxy.
 *
 * Until kit 1.5.0: the kit's `useBlogPoll` / `getPollVoterId`
 * (`client/use-blog.hook.ts`) do the same with the same cookie and storage
 * key, so switching keeps every shopper's vote.
 */

// ─── Constants ────────────────────────────────────────────────────────────

export const POLL_VOTER_COOKIE = "zc_poll_voter";
export const POLL_VOTER_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

const VOTER_ID_PATTERN = /^[A-Za-z0-9-]{16,64}$/;

/** Shopper copy for the poll's error keys (`extensions.reason` / code). */
export const POLL_ERROR_MESSAGES = {
  POLL_CLOSED: "This poll has closed.",
  POLL_NOT_FOUND: "This poll is no longer available.",
  RATE_LIMITED: "Too many votes from this network. Please try again later.",
};

// ─── Voter id ─────────────────────────────────────────────────────────────

/** The value of cookie `name` in a `document.cookie` string, or null. */
export const readCookieValue = (cookies = "", name = POLL_VOTER_COOKIE) => {
  const prefix = `${name}=`;
  for (const part of String(cookies).split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return null;
};

export const isPollVoterId = (value) =>
  typeof value === "string" && VOTER_ID_PATTERN.test(value);

/** The `document.cookie` assignment for a voter id. */
export const buildPollVoterCookie = (id, secure = true) =>
  `${POLL_VOTER_COOKIE}=${id}; Max-Age=${POLL_VOTER_MAX_AGE_SECONDS}` +
  `; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;

const randomId = () => {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

/** This browser's voter id, created (cookie set) on first use; null on the server. */
export const getPollVoterId = () => {
  if (typeof document === "undefined") return null;
  const existing = readCookieValue(document.cookie);
  if (isPollVoterId(existing)) return existing;
  const id = randomId();
  document.cookie = buildPollVoterCookie(
    id,
    window.location.protocol === "https:",
  );
  return id;
};

// ─── Voted memory (a convenience; the server dedupes on the cookie) ────────

const votedKey = (pollId) => `zcom:poll:${pollId}`;

export const readVotedOption = (pollId) => {
  try {
    return window.localStorage.getItem(votedKey(pollId));
  } catch {
    return null;
  }
};

export const rememberVotedOption = (pollId, optionId) => {
  try {
    window.localStorage.setItem(votedKey(pollId), optionId);
  } catch {
    // Storage blocked: the results just won't show again on the next visit
  }
};

// ─── Results ──────────────────────────────────────────────────────────────

/** True once `closesAt` has passed (the server decides; this only shows it). */
export const isPollPastClose = (closesAt, now = Date.now()) => {
  const at = closesAt ? Date.parse(closesAt) : NaN;
  return Number.isFinite(at) && at <= now;
};

/**
 * One bar per option, in the poll's order: votes and a whole percent of the
 * total (0 when nobody voted). Options the results don't name read 0.
 */
export const toPollBars = (options = [], results = null) => {
  const counts = new Map(
    (results?.options || []).map((option) => [option.optionId, option.votes]),
  );
  const total = results?.total || 0;
  return options.map((option) => {
    const votes = counts.get(option.id) || 0;
    return {
      id: option.id,
      label: option.label,
      votes,
      percent: total > 0 ? Math.round((votes / total) * 100) : 0,
    };
  });
};

/** "1 vote" / "12 votes". */
export const formatVoteCount = (total = 0) =>
  `${total} ${total === 1 ? "vote" : "votes"}`;

// ─── Related posts ────────────────────────────────────────────────────────

/**
 * The posts a related-posts block shows (D5): the merchant's chosen posts in
 * their order (ids that didn't load are skipped), else the automatic ones.
 */
export const pickRelatedPosts = (block, { postsById, automatic } = {}) => {
  if (!block?.postIds?.length) return automatic || [];
  return block.postIds.map((id) => postsById?.[id]).filter(Boolean);
};
