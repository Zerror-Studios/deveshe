"use client";

/**
 * A blog poll (backend PRD-047 FR-11, §6, D4): a labelled radio group and a
 * Vote button; after voting (or once the poll closed) the results as bars,
 * announced to screen readers. No sign-in: one vote per browser through the
 * `zc_poll_voter` cookie (`utils/blog-blocks.util.js`), sent through the
 * kit's `/v1/graphql` proxy.
 *
 * Rendered in place of the `data-zc-block="poll"` placeholder of the post
 * body (`BlogPostDetail`).
 */

import React, { useCallback, useEffect, useId, useState } from "react";
import { useApolloClient } from "@apollo/client/react";

import { GET_BLOG_POLL_RESULTS, VOTE_BLOG_POLL } from "@/graphql";
import {
  getErrorCode,
  getErrorMessage,
  getErrorReason,
} from "@/utils/api-error.util";
import {
  POLL_ERROR_MESSAGES,
  formatVoteCount,
  getPollVoterId,
  isPollPastClose,
  readVotedOption,
  rememberVotedOption,
  toPollBars,
} from "@/utils/blog-blocks.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

const toResultsSummary = (results, message) =>
  [
    `${formatVoteCount(results.total)}${results.closed ? " · Poll closed" : ""}.`,
    message,
  ]
    .filter(Boolean)
    .join(" ");

// ─── Component ────────────────────────────────────────────────────────────

export default function BlogPoll({ blogSlug, poll }) {
  const client = useApolloClient();
  const baseId = useId();
  const [selected, setSelected] = useState("");
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [results, setResults] = useState(null);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");

  const pastClose = isPollPastClose(poll.closesAt);
  const showResults =
    Boolean(results) && (Boolean(votedOptionId) || results.closed);
  const closed = pastClose || Boolean(results?.closed);

  const loadResults = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: GET_BLOG_POLL_RESULTS,
        variables: { blogSlug, pollId: poll.pollId },
        fetchPolicy: "network-only",
      });
      if (data?.blogPollResults) setResults(data.blogPollResults);
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          "We couldn't load the results.",
          POLL_ERROR_MESSAGES,
        ),
      );
    }
  }, [client, blogSlug, poll.pollId]);

  // A browser that voted, or a closed poll, shows the results
  useEffect(() => {
    const voted = readVotedOption(poll.pollId);
    if (voted) setVotedOptionId(voted);
    if (voted || pastClose) loadResults();
  }, [poll.pollId, pastClose, loadResults]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected || voting) return;
    const voterId = getPollVoterId();
    if (!voterId) return;
    setVoting(true);
    setMessage("");
    try {
      const { data } = await client.mutate({
        mutation: VOTE_BLOG_POLL,
        variables: {
          blogSlug,
          pollId: poll.pollId,
          optionId: selected,
          voterId,
        },
      });
      if (data?.voteBlogPoll) {
        setResults(data.voteBlogPoll);
        setVotedOptionId(selected);
        rememberVotedOption(poll.pollId, selected);
        setMessage("Thanks for voting.");
      }
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          "We couldn't record your vote. Please try again.",
          POLL_ERROR_MESSAGES,
        ),
      );
      // A closed poll still shows how it ended
      if ([getErrorReason(error), getErrorCode(error)].includes("POLL_CLOSED")) {
        loadResults();
      }
    } finally {
      setVoting(false);
    }
  };

  const questionId = `${baseId}-question`;
  const bars = toPollBars(poll.options, results);

  return (
    <section className="blog-poll" aria-labelledby={questionId}>
      <p className="blog-poll__eyebrow">(Poll)</p>
      <p id={questionId} className="blog-poll__question">
        {poll.question || "Cast your vote"}
      </p>

      {showResults ? (
        <ul className="blog-poll__results">
          {bars.map((bar) => (
            <li key={bar.id} className="blog-poll__result">
              <div className="blog-poll__resultHead">
                <span>
                  {bar.label}
                  {bar.id === votedOptionId ? (
                    <span className="blog-poll__yours"> (your vote)</span>
                  ) : null}
                </span>
                <span>{bar.percent}%</span>
              </div>
              <span className="blog-poll__bar" aria-hidden>
                <span
                  className="blog-poll__barFill"
                  style={{ width: `${bar.percent}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <form className="blog-poll__form" onSubmit={handleSubmit}>
          <fieldset className="blog-poll__fieldset" disabled={closed || voting}>
            <legend className="blog-poll__legend">
              {poll.question || "Cast your vote"}
            </legend>
            {poll.options.map((option) => (
              <label key={option.id} className="blog-poll__option">
                <input
                  type="radio"
                  name={`${baseId}-option`}
                  value={option.id}
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
          <button
            type="submit"
            className="blog-poll__vote"
            disabled={!selected || voting || closed}
          >
            {voting ? "Voting…" : closed ? "Poll closed" : "Vote"}
          </button>
        </form>
      )}

      <p className="blog-poll__status" role="status" aria-live="polite">
        {showResults ? toResultsSummary(results, message) : message}
      </p>
    </section>
  );
}
