/**
 * Backend PRD-047 FR-11: the post body through the kit renderer, the
 * store's sanitiser with the new blocks, and the poll and related-posts
 * helpers.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { normalizeBlogContent } from "@/utils/parseBlogContent";
import { parseSafeHtml } from "@/utils/sanitize-html.util";
import {
  getBlogBlocks,
  readBlogBlock,
  renderBlogContent,
} from "@/utils/kit-blog-content.util";
import {
  buildPollVoterCookie,
  formatVoteCount,
  isPollPastClose,
  isPollVoterId,
  pickRelatedPosts,
  readCookieValue,
  toPollBars,
} from "@/utils/blog-blocks.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

const text = (value) => ({ type: "text", text: value });
const p = (...content) => ({ type: "paragraph", content });
const doc = (...content) => ({ type: "doc", content });
const toBody = (...content) =>
  normalizeBlogContent(JSON.stringify(doc(...content))).contentHtml;
/** What the post page shows: the store's sanitiser, rendered to markup. */
const toPage = (html) =>
  renderToStaticMarkup(createElement(Fragment, null, parseSafeHtml(html)));

const poll = {
  type: "poll",
  attrs: {
    pollId: "poll-1",
    question: "Linen or cotton?",
    options: [
      { id: "a", label: "Linen" },
      { id: "b", label: "Cotton" },
    ],
  },
};

const table = {
  type: "table",
  content: [
    {
      type: "tableRow",
      content: [
        { type: "tableHeader", content: [p(text("Size"))] },
        { type: "tableHeader", content: [p(text("Chest"))] },
      ],
    },
    {
      type: "tableRow",
      content: [
        { type: "tableCell", content: [p(text("S"))] },
        { type: "tableCell", attrs: { colspan: 2 }, content: [p(text("36"))] },
      ],
    },
  ],
};

// ─── Renderer through the store ───────────────────────────────────────────

test("tables keep their structure in a sideways-scrolling wrapper", () => {
  const page = toPage(toBody(table));
  assert.match(page, /<div class="zc-blog-table"><table><thead><tr><th>Size<\/th>/);
  assert.match(page, /<td colSpan="2">36<\/td>|<td colspan="2">36<\/td>/);
});

test("expandable items are native details", () => {
  const page = toPage(
    toBody({
      type: "details",
      attrs: { open: false },
      content: [
        { type: "detailsSummary", content: [text("Question")] },
        { type: "detailsContent", content: [p(text("Answer"))] },
      ],
    }),
  );
  assert.match(page, /<details class="zc-blog-details"><summary>Question<\/summary>/);
  assert.match(page, /<p>Answer<\/p><\/div><\/details>/);
});

test("galleries, videos and embeds render (they rendered nothing before)", () => {
  const page = toPage(
    toBody(
      {
        type: "galleryBlock",
        attrs: { layout: "slider", data: [{ src: "/1.jpg", alt: "One", caption: "Front" }] },
      },
      { type: "videoBlock", attrs: { src: "https://media.example.com/v.mp4" } },
      { type: "embed", attrs: { embed: "https://youtu.be/dQw4w9WgXcQ" } },
    ),
  );
  assert.match(page, /zc-blog-gallery--slider/);
  assert.match(page, /<img src="\/1.jpg" alt="One"/);
  assert.match(page, /<figcaption>Front<\/figcaption>/);
  assert.match(page, /<video src="https:\/\/media.example.com\/v.mp4" controls=""/);
  assert.match(page, /<iframe src="https:\/\/www.youtube.com\/embed\/dQw4w9WgXcQ"/);
  assert.match(page, /sandbox="allow-scripts allow-same-origin/);
});

test("an HTML block keeps safe markup and loses scripts", () => {
  const page = toPage(
    toBody({
      type: "htmlBlock",
      attrs: { html: '<p>Hi</p><script>alert(1)</script><img src="x" onerror="alert(1)">' },
    }),
  );
  assert.match(page, /<div class="zc-blog-html"><p>Hi<\/p>/);
  assert.doesNotMatch(page, /script|onerror/i);
});

test("the duplicate intro paragraph is still dropped", () => {
  const html = normalizeBlogContent(
    JSON.stringify(doc(p(text("Lead text")), p(text("Body")))),
    "Lead text",
  ).contentHtml;
  assert.equal(html, "<p>Body</p>");
});

// ─── Sanitiser ────────────────────────────────────────────────────────────

test("iframes survive only from the embed allowlist, always sandboxed", () => {
  const page = toPage(
    '<iframe src="https://evil.example/x"></iframe>' +
      '<iframe src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" sandbox="allow-top-navigation" onload="x()"></iframe>',
  );
  assert.doesNotMatch(page, /evil\.example|allow-top-navigation|onload/);
  assert.match(page, /<iframe src="https:\/\/www.youtube.com\/embed\/dQw4w9WgXcQ"/);
  assert.match(page, /sandbox="allow-scripts allow-same-origin allow-popups/);
});

test("placeholders keep their data attributes; other data attributes go", () => {
  const html = toBody(poll);
  const page = toPage(html.replace("<div", '<div data-other="x"'));
  assert.match(page, /data-zc-block="poll"/);
  assert.match(page, /data-zc-poll-id="poll-1"/);
  assert.doesNotMatch(page, /data-other/);
});

test("the body's replace callback sees the poll placeholder", () => {
  const seen = [];
  parseSafeHtml(toBody(p(text("Intro")), poll), {
    replace: (node) => {
      const block = node.type === "tag" ? readBlogBlock(node.attribs) : null;
      if (block) seen.push(block);
      return undefined;
    },
  });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].type, "poll");
  assert.deepEqual(seen[0].options.map((o) => o.label), ["Linen", "Cotton"]);
});

// ─── Related posts ────────────────────────────────────────────────────────

test("a related-posts block shows its chosen posts, else the automatic ones", () => {
  const content = JSON.stringify(
    doc(
      { type: "relatedPosts", attrs: { postIds: ["b", "missing", "a"], title: "More" } },
      { type: "relatedPosts", attrs: { postIds: [] } },
    ),
  );
  const [chosen, automatic] = getBlogBlocks(content).relatedPosts;
  const postsById = { a: { _id: "a" }, b: { _id: "b" } };
  const auto = [{ _id: "z" }];
  assert.deepEqual(
    pickRelatedPosts(chosen, { postsById, automatic: auto }).map((post) => post._id),
    ["b", "a"],
  );
  assert.deepEqual(pickRelatedPosts(automatic, { postsById, automatic: auto }), auto);
  assert.equal(
    renderBlogContent(content).match(/data-zc-block="related-posts"/g).length,
    2,
  );
});

// ─── Poll helpers ─────────────────────────────────────────────────────────

test("the voter cookie is a year, Lax, Secure on https, path-wide", () => {
  const cookie = buildPollVoterCookie("0f8f4c7e-9a1b-4c2d-8e3f-1a2b3c4d5e6f", true);
  assert.equal(
    cookie,
    "zc_poll_voter=0f8f4c7e-9a1b-4c2d-8e3f-1a2b3c4d5e6f; Max-Age=31536000; Path=/; SameSite=Lax; Secure",
  );
  assert.doesNotMatch(buildPollVoterCookie("x", false), /Secure/);
  assert.equal(readCookieValue("a=1; zc_poll_voter=abc; b=2"), "abc");
  assert.equal(readCookieValue("a=1"), null);
  assert.equal(isPollVoterId("0f8f4c7e-9a1b-4c2d-8e3f-1a2b3c4d5e6f"), true);
  assert.equal(isPollVoterId("short"), false);
  assert.equal(isPollVoterId("<script>alert(1)</script>xxxxxxxx"), false);
});

test("results bars: percent of the total, poll order, zero when nobody voted", () => {
  const options = poll.attrs.options;
  assert.deepEqual(
    toPollBars(options, {
      total: 3,
      options: [
        { optionId: "b", votes: 2 },
        { optionId: "a", votes: 1 },
      ],
    }),
    [
      { id: "a", label: "Linen", votes: 1, percent: 33 },
      { id: "b", label: "Cotton", votes: 2, percent: 67 },
    ],
  );
  assert.deepEqual(
    toPollBars(options, { total: 0, options: [] }).map((bar) => bar.percent),
    [0, 0],
  );
  assert.equal(formatVoteCount(1), "1 vote");
  assert.equal(formatVoteCount(12), "12 votes");
});

test("a poll past its close date reads as closed", () => {
  const now = Date.parse("2026-11-17T10:00:00Z");
  assert.equal(isPollPastClose("2026-11-17T09:00:00Z", now), true);
  assert.equal(isPollPastClose("2026-11-18T09:00:00Z", now), false);
  assert.equal(isPollPastClose(null, now), false);
});
