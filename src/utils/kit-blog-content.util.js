/**
 * Blog post body: TipTap JSON → safe HTML (backend PRD-047 FR-10, FR-11).
 *
 * UNTIL KIT 1.5.0: a copy of the kit's `renderBlogContent` and embed
 * allowlist (`zcom-storefront-kit/src/core/blog-content.util.ts` and
 * `embed-url.util.ts`, types stripped, otherwise unchanged). This store pins
 * kit v1.4.0, which doesn't have them. Once `package.json` pins kit 1.5.0,
 * replace this whole file with
 *
 *   export {
 *     BLOG_RELATED_POSTS_MAX_IDS, EMBED_IFRAME_ALLOW, EMBED_IFRAME_SANDBOX,
 *     blogBlockEnum, blogContentToText, getBlogBlocks, parseBlogDoc,
 *     readBlogBlock, renderBlogContent, toSafeEmbedSrc,
 *   } from "@zcom/storefront-kit/core";
 *
 * Never fix a rendering bug here only: fix the kit and re-copy.
 * `test/blog-content.test.mjs` pins the output.
 *
 * Difference while on 1.4.0: an `htmlBlock` goes through 1.4.0's
 * `sanitizeHtml`, which doesn't keep `details`, `summary` or `mark` yet.
 */

import { sanitizeHtml } from "@zcom/storefront-kit/core";

// ─── Embed allowlist (kit `embed-url.util.ts`) ──────────────────────────────

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);
const TWITTER_HOSTS = new Set([
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "platform.twitter.com",
]);
const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
]);
const GOOGLE_MAPS_HOSTS = new Set(["www.google.com", "maps.google.com"]);

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_PATH_PATTERN = /^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/;
const VIMEO_PATH_PATTERN = /^\/(?:video\/)?(\d+)/;
const INSTAGRAM_PATH_PATTERN = /^\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/;
const TWITTER_STATUS_PATTERN = /^\/\w+\/status\/(\d+)/;
const TWITTER_ID_PATTERN = /^\d+$/;
const FACEBOOK_PLUGIN_PATTERN = /^\/plugins\/(post|video)\.php$/;
const FACEBOOK_VIDEO_PATTERN = /\/videos?\/|video\.php|\/watch\/?/;
const IFRAME_SRC_PATTERN = /<iframe\b[^>]*?\ssrc\s*=\s*(["'])(.*?)\1/i;

export const embedProviderEnum = {
  YOUTUBE: "youtube",
  VIMEO: "vimeo",
  INSTAGRAM: "instagram",
  TWITTER: "twitter",
  FACEBOOK: "facebook",
  GOOGLE_MAPS: "google-maps",
};

/**
 * Sandbox for embed iframes. The players need scripts and same-origin; that
 * is safe only because `src` is always a cross-origin allowlisted provider.
 */
export const EMBED_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups " +
  "allow-popups-to-escape-sandbox allow-presentation";

/** Feature policy for embed iframes. */
export const EMBED_IFRAME_ALLOW =
  "encrypted-media; picture-in-picture; fullscreen; clipboard-write";

// ─── Helpers ────────────────────────────────────────────────────────────────

const extractCandidate = (value) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("<")) return trimmed;
  return (trimmed.match(IFRAME_SRC_PATTERN)?.[2] ?? "")
    .replace(/&amp;/g, "&")
    .trim();
};

const parseHttpsUrl = (candidate) => {
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

const toYouTubeSrc = (url) => {
  let id = null;
  if (url.hostname === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] ?? null;
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else {
    id = url.pathname.match(YOUTUBE_PATH_PATTERN)?.[1] ?? null;
  }
  if (!id || !YOUTUBE_ID_PATTERN.test(id)) return null;
  return `https://www.youtube.com/embed/${id}`;
};

const toVimeoSrc = (url) => {
  const id = url.pathname.match(VIMEO_PATH_PATTERN)?.[1];
  return id ? `https://player.vimeo.com/video/${id}` : null;
};

const toInstagramSrc = (url) => {
  const code = url.pathname.match(INSTAGRAM_PATH_PATTERN)?.[1];
  return code ? `https://www.instagram.com/p/${code}/embed` : null;
};

const toTwitterSrc = (url) => {
  const id =
    url.hostname === "platform.twitter.com"
      ? url.searchParams.get("id")
      : url.pathname.match(TWITTER_STATUS_PATTERN)?.[1];
  if (!id || !TWITTER_ID_PATTERN.test(id)) return null;
  return `https://platform.twitter.com/embed/Tweet.html?id=${id}`;
};

const buildFacebookPluginSrc = (kind, target) =>
  `https://www.facebook.com/plugins/${kind}.php?href=${encodeURIComponent(
    target.toString(),
  )}`;

const toFacebookSrc = (url) => {
  const plugin = url.pathname.match(FACEBOOK_PLUGIN_PATTERN);
  if (plugin) {
    const target = parseHttpsUrl(url.searchParams.get("href") ?? "");
    if (!target || !FACEBOOK_HOSTS.has(target.hostname)) return null;
    return buildFacebookPluginSrc(plugin[1] ?? "post", target);
  }
  const kind = FACEBOOK_VIDEO_PATTERN.test(url.pathname + url.search)
    ? "video"
    : "post";
  return buildFacebookPluginSrc(kind, url);
};

const toGoogleMapsSrc = (url) =>
  url.pathname.startsWith("/maps/embed")
    ? `https://www.google.com/maps/embed${url.search}`
    : null;

// ─── API ────────────────────────────────────────────────────────────────────

/** An allowlisted embed: the rebuilt https `src` and its provider. */

/** The allowlisted embed for `value`, or null for anything else. */
export const toSafeEmbed = (
  value,
) => {
  if (!value || typeof value !== "string") return null;
  const url = parseHttpsUrl(extractCandidate(value));
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  const build = (
    src,
    provider,
  ) => (src ? { src, provider } : null);
  if (YOUTUBE_HOSTS.has(host)) {
    return build(toYouTubeSrc(url), embedProviderEnum.YOUTUBE);
  }
  if (VIMEO_HOSTS.has(host)) {
    return build(toVimeoSrc(url), embedProviderEnum.VIMEO);
  }
  if (INSTAGRAM_HOSTS.has(host)) {
    return build(toInstagramSrc(url), embedProviderEnum.INSTAGRAM);
  }
  if (TWITTER_HOSTS.has(host)) {
    return build(toTwitterSrc(url), embedProviderEnum.TWITTER);
  }
  if (FACEBOOK_HOSTS.has(host)) {
    return build(toFacebookSrc(url), embedProviderEnum.FACEBOOK);
  }
  if (GOOGLE_MAPS_HOSTS.has(host)) {
    return build(toGoogleMapsSrc(url), embedProviderEnum.GOOGLE_MAPS);
  }
  return null;
};

/** The allowlisted https embed URL for `value`, or null. */
export const toSafeEmbedSrc = (
  value,
) => toSafeEmbed(value)?.src ?? null;

// ─── Blog renderer (kit `blog-content.util.ts`) ─────────────────────────────


// ─── Types ──────────────────────────────────────────────────────────────────

export const blogBlockEnum = {
  POLL: "poll",
  RELATED_POSTS: "related-posts",
};

// ─── Constants ──────────────────────────────────────────────────────────────

/** Attribute naming a placeholder's block type. */
export const BLOG_BLOCK_ATTRIBUTE = "data-zc-block";
/** Attribute holding a placeholder's JSON payload. */
export const BLOG_BLOCK_PAYLOAD_ATTRIBUTE = "data-zc-payload";

/** Backend FR-9: a related-posts block names at most 12 posts. */
export const BLOG_RELATED_POSTS_MAX_IDS = 12;
/** Backend FR-6: a poll has 2–6 options of at most 80 characters. */
export const BLOG_POLL_MIN_OPTIONS = 2;
export const BLOG_POLL_MAX_OPTIONS = 6;
export const BLOG_POLL_OPTION_MAX_LENGTH = 80;

const POLL_QUESTION_MAX_LENGTH = 300;
const RELATED_TITLE_MAX_LENGTH = 120;
const GALLERY_MAX_ITEMS = 60;
const MAX_DEPTH = 64;

const GALLERY_LAYOUTS = new Set([
  "grid",
  "masonry",
  "collage",
  "thumbnails",
  "panorama",
  "columns",
  "slider",
]);
const RELATED_LAYOUTS = new Set(["grid", "list", "carousel"]);
const ALIGNMENTS = new Set(["left", "center", "right"]);
const LINK_TARGETS = new Set(["_blank", "_self"]);

/** Innermost first, so a link wraps the bold text inside it. */
const MARK_ORDER = [
  "code",
  "highlight",
  "strike",
  "underline",
  "italic",
  "bold",
  "link",
];

const INLINE_TYPES = new Set(["text", "hardBreak", "image", "mention"]);
const SAFE_LINK_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_MEDIA_SCHEMES = new Set(["http:", "https:"]);
const SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*:)/i;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0020\u007f-\u009f]/g;
const PERCENT_WIDTH = /^(\d{1,3})%$/;
const CODE_LANGUAGE = /^[a-z0-9+#-]{1,20}$/i;
const BLOCK_DATA_ATTR = /\sdata-zc-[a-z-]+="[^"]*"/gi;

// ─── Escaping and URLs ──────────────────────────────────────────────────────

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const asString = (value) =>
  typeof value === "string" ? value : "";

const asPositiveNumber = (value) => {
  const number = typeof value === "string" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) && number > 0
    ? Math.round(number)
    : null;
};

const checkUrl = (value, schemes) => {
  const raw = asString(value).trim();
  if (!raw) return null;
  const url = raw.replace(CONTROL_CHARS, "");
  const scheme = url.match(SCHEME_PATTERN)?.[1]?.toLowerCase();
  if (scheme && !schemes.has(scheme)) return null;
  return raw;
};

/** Relative, http(s), mailto or tel links only. */
export const toSafeLinkHref = (value) =>
  checkUrl(value, SAFE_LINK_SCHEMES);

/** Relative or http(s) image and video URLs only (no data: or blob:). */
export const toSafeMediaSrc = (value) =>
  checkUrl(value, SAFE_MEDIA_SCHEMES);

// ─── Block payloads ─────────────────────────────────────────────────────────

/** A valid poll from node attrs or a payload, else null. */
export const toBlogPoll = (value) => {
  if (!value || typeof value !== "object") return null;
  const attrs = value;
  const pollId = asString(attrs.pollId).trim();
  const question = asString(attrs.question)
    .trim()
    .slice(0, POLL_QUESTION_MAX_LENGTH);
  if (!pollId || !Array.isArray(attrs.options)) return null;
  const seen = new Set();
  const options = [];
  for (const option of attrs.options) {
    if (!option || typeof option !== "object") continue;
    const id = asString((option).id).trim();
    const label = asString((option).label)
      .trim()
      .slice(0, BLOG_POLL_OPTION_MAX_LENGTH);
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    options.push({ id, label });
  }
  if (options.length < BLOG_POLL_MIN_OPTIONS) return null;
  const closesAt = asString(attrs.closesAt).trim();
  return {
    pollId,
    question,
    options: options.slice(0, BLOG_POLL_MAX_OPTIONS),
    closesAt: closesAt && !Number.isNaN(Date.parse(closesAt)) ? closesAt : null,
  };
};

/** A related-posts block from node attrs or a payload, else null. */
export const toBlogRelatedPosts = (
  value,
) => {
  if (!value || typeof value !== "object") return null;
  const attrs = value;
  const ids = Array.isArray(attrs.postIds) ? attrs.postIds : [];
  const postIds = [
    ...new Set(
      ids
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter(Boolean),
    ),
  ].slice(0, BLOG_RELATED_POSTS_MAX_IDS);
  const layout = asString(attrs.layout);
  return {
    postIds,
    title: asString(attrs.title).trim().slice(0, RELATED_TITLE_MAX_LENGTH),
    layout: RELATED_LAYOUTS.has(layout) ? layout : "grid",
  };
};

/**
 * Reads a placeholder's attributes (from the store's HTML parser) back into
 * a checked block; null for anything that isn't one.
 */
export const readBlogBlock = (
  attributes,
) => {
  const type = attributes?.[BLOG_BLOCK_ATTRIBUTE];
  if (type !== blogBlockEnum.POLL && type !== blogBlockEnum.RELATED_POSTS) {
    return null;
  }
  let payload = null;
  try {
    payload = JSON.parse(attributes?.[BLOG_BLOCK_PAYLOAD_ATTRIBUTE] ?? "");
  } catch {
    return null;
  }
  if (type === blogBlockEnum.POLL) {
    const poll = toBlogPoll(payload);
    return poll ? { type, ...poll } : null;
  }
  const related = toBlogRelatedPosts(payload);
  return related ? { type, ...related } : null;
};

// ─── Parsing ────────────────────────────────────────────────────────────────

const isDoc = (value) =>
  !!value &&
  typeof value === "object" &&
  (value).type === "doc" &&
  Array.isArray((value).content);

/** The TipTap document in `input` (object or JSON string), else null. */
export const parseBlogDoc = (input) => {
  if (isDoc(input)) return input;
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith('"')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (isDoc(parsed)) return parsed;
    // Some old posts were stringified twice.
    return typeof parsed === "string" ? parseBlogDoc(parsed) : null;
  } catch {
    return null;
  }
};

// ─── Rendering: shared pieces ───────────────────────────────────────────────

const children = (node) =>
  Array.isArray(node.content) ? node.content : [];

/** `style` and class for a block's width ("60%") and alignment. */
const sizing = (attrs) => {
  const width = asString(attrs.width).match(PERCENT_WIDTH)?.[1];
  const percent = width ? Number(width) : 100;
  const align = asString(attrs.align || attrs.alignment);
  const narrow = percent > 0 && percent < 100;
  return {
    className:
      narrow && ALIGNMENTS.has(align) ? ` zc-blog-align-${align}` : "",
    style: narrow ? ` style="width: ${percent}%"` : "",
  };
};

const imageAttrs = (attrs) => {
  const asset = (attrs.asset ?? {});
  return {
    src: toSafeMediaSrc(attrs.src || attrs.path || attrs.url || asset.path),
    alt: asString(attrs.alt || attrs.altText || attrs.title),
    caption: asString(attrs.caption).trim(),
    width: asPositiveNumber(attrs.widthPx),
    height: asPositiveNumber(attrs.heightPx),
  };
};

const imgTag = (
  src,
  alt,
  width,
  height,
  className = "",
) => {
  const size = width && height ? ` width="${width}" height="${height}"` : "";
  const cls = className ? ` class="${className}"` : "";
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${cls}${size} loading="lazy" />`;
};

// ─── Rendering: inline ──────────────────────────────────────────────────────

const applyMark = (html, mark) => {
  switch (mark.type) {
    case "bold":
      return `<strong>${html}</strong>`;
    case "italic":
      return `<em>${html}</em>`;
    case "underline":
      return `<u>${html}</u>`;
    case "strike":
      return `<s>${html}</s>`;
    case "code":
      return `<code>${html}</code>`;
    case "highlight":
      return `<mark>${html}</mark>`;
    case "link": {
      const href = toSafeLinkHref(mark.attrs?.href);
      if (!href) return html;
      const target = asString(mark.attrs?.target);
      const opens = LINK_TARGETS.has(target) ? target : "";
      const targetAttr = opens ? ` target="${opens}"` : "";
      const rel = opens === "_blank" ? ' rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${targetAttr}${rel}>${html}</a>`;
    }
    default:
      return html;
  }
};

const renderText = (node) => {
  const marks = Array.isArray(node.marks) ? node.marks : [];
  const ordered = [...marks].sort(
    (a, b) =>
      MARK_ORDER.indexOf(a.type ?? "") - MARK_ORDER.indexOf(b.type ?? ""),
  );
  return ordered.reduce(
    (html, mark) => applyMark(html, mark),
    escapeHtml(node.text ?? ""),
  );
};

const renderInline = (node, depth) => {
  if (depth > MAX_DEPTH) return "";
  switch (node.type) {
    case "text":
      return renderText(node);
    case "hardBreak":
      return "<br />";
    case "image":
    case "imageBlock": {
      const image = imageAttrs(node.attrs ?? {});
      return image.src
        ? imgTag(
          image.src,
          image.alt,
          image.width,
          image.height,
          "zc-blog-inline-image",
        )
        : "";
    }
    default:
      return renderInlines(children(node), depth + 1);
  }
};

const renderInlines = (nodes, depth) =>
  nodes.map((node) => renderInline(node, depth)).join("");

// ─── Rendering: blocks ──────────────────────────────────────────────────────

const renderFigure = (attrs) => {
  const image = imageAttrs(attrs);
  if (!image.src) return "";
  const { className, style } = sizing(attrs);
  const ratio =
    image.width && image.height
      ? ` style="aspect-ratio: ${image.width} / ${image.height}"`
      : "";
  const caption = image.caption
    ? `<figcaption>${escapeHtml(image.caption)}</figcaption>`
    : "";
  return (
    `<figure class="zc-blog-figure${className}"${style}>` +
    `<div class="zc-blog-figure__media"${ratio}>` +
    imgTag(image.src, image.alt, image.width, image.height) +
    `</div>${caption}</figure>`
  );
};

const renderEmbed = (attrs) => {
  const embed = toSafeEmbed(
    asString(attrs.embed) || asString(attrs.embedFrame) || asString(attrs.src),
  );
  if (!embed) return "";
  const { className, style } = sizing(attrs);
  const title =
    asString(attrs.alt).trim() || `Embedded ${embed.provider} content`;
  return (
    `<div class="zc-blog-embed zc-blog-embed--${embed.provider}${className}"${style}>` +
    `<iframe src="${escapeHtml(embed.src)}" title="${escapeHtml(title)}"` +
    ` sandbox="${EMBED_IFRAME_SANDBOX}" allow="${EMBED_IFRAME_ALLOW}"` +
    ' loading="lazy" referrerpolicy="strict-origin-when-cross-origin"' +
    " allowfullscreen></iframe></div>"
  );
};

const renderVideo = (attrs) => {
  // A YouTube or Vimeo link saved as a video plays as an embed.
  if (toSafeEmbed(asString(attrs.src))) return renderEmbed(attrs);
  const src = toSafeMediaSrc(attrs.src);
  if (!src) return "";
  const { className, style } = sizing(attrs);
  const title = asString(attrs.alt).trim();
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
  return (
    `<figure class="zc-blog-video${className}"${style}>` +
    `<video src="${escapeHtml(src)}"${titleAttr} controls preload="metadata"` +
    " playsinline></video></figure>"
  );
};

const renderGallery = (attrs) => {
  const items = Array.isArray(attrs.data) ? attrs.data : [];
  const figures = items
    .slice(0, GALLERY_MAX_ITEMS)
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const entry = item;
      const src = toSafeMediaSrc(entry.src || entry.path || entry.url);
      if (!src) return "";
      const caption = asString(entry.caption).trim();
      const courtesy = asString(entry.courtesy).trim();
      const credit = courtesy
        ? `<small class="zc-blog-gallery__courtesy">${escapeHtml(courtesy)}</small>`
        : "";
      const figcaption =
        caption || courtesy
          ? `<figcaption>${escapeHtml(caption)}${caption && credit ? " " : ""}${credit}</figcaption>`
          : "";
      return (
        '<figure class="zc-blog-gallery__item">' +
        imgTag(src, asString(entry.alt), null, null) +
        `${figcaption}</figure>`
      );
    })
    .filter(Boolean);
  if (!figures.length) return "";
  const layout = asString(attrs.layout);
  const name = GALLERY_LAYOUTS.has(layout) ? layout : "grid";
  const { className, style } = sizing(attrs);
  return (
    `<div class="zc-blog-gallery zc-blog-gallery--${name}${className}"${style}>` +
    `${figures.join("")}</div>`
  );
};

const renderTableCell = (cell, depth) => {
  const tag = cell.type === "tableHeader" ? "th" : "td";
  const attrs = cell.attrs ?? {};
  const colspan = asPositiveNumber(attrs.colspan);
  const rowspan = asPositiveNumber(attrs.rowspan);
  const widths = Array.isArray(attrs.colwidth) ? attrs.colwidth : [];
  const width = widths.length === 1 ? asPositiveNumber(widths[0]) : null;
  const span =
    (colspan && colspan > 1 ? ` colspan="${colspan}"` : "") +
    (rowspan && rowspan > 1 ? ` rowspan="${rowspan}"` : "") +
    (width ? ` style="min-width: ${width}px"` : "");
  const content = children(cell);
  // A cell's one paragraph needs no <p> (and no paragraph margins)
  const only = content.length === 1 ? content[0] : null;
  const inner =
    only?.type === "paragraph"
      ? renderInlines(children(only), depth + 1)
      : renderBlocks(content, depth + 1);
  return `<${tag}${span}>${inner}</${tag}>`;
};

const renderTable = (node, depth) => {
  const rows = children(node).filter((row) => row.type === "tableRow");
  if (!rows.length) return "";
  const html = rows.map(
    (row) =>
      `<tr>${children(row)
        .map((cell) => renderTableCell(cell, depth + 1))
        .join("")}</tr>`,
  );
  const first = rows[0] ? children(rows[0]) : [];
  const headed =
    first.length > 0 && first.every((cell) => cell.type === "tableHeader");
  const head = headed ? `<thead>${html[0]}</thead>` : "";
  const body = (headed ? html.slice(1) : html).join("");
  return (
    '<div class="zc-blog-table"><table>' +
    `${head}${body ? `<tbody>${body}</tbody>` : ""}</table></div>`
  );
};

const renderDetails = (node, depth) => {
  const parts = children(node);
  const summary = parts.find((part) => part.type === "detailsSummary");
  const content = parts.filter((part) => part.type !== "detailsSummary");
  const summaryHtml = summary
    ? renderInlines(children(summary), depth + 1).trim()
    : "";
  const body = content
    .map((part) =>
      part.type === "detailsContent"
        ? renderBlocks(children(part), depth + 1)
        : renderBlock(part, depth + 1),
    )
    .join("");
  if (!summaryHtml && !body) return "";
  const open = node.attrs?.open === true ? " open" : "";
  return (
    `<details class="zc-blog-details"${open}>` +
    (summaryHtml ? `<summary>${summaryHtml}</summary>` : "") +
    `<div class="zc-blog-details__content">${body}</div></details>`
  );
};

const renderHtmlBlock = (attrs) => {
  // No placeholder may come from merchant HTML: only the renderer makes them
  const html = sanitizeHtml(asString(attrs.html))
    .replace(BLOCK_DATA_ATTR, "")
    .trim();
  return html ? `<div class="zc-blog-html">${html}</div>` : "";
};

const payloadAttr = (value) =>
  ` ${BLOG_BLOCK_PAYLOAD_ATTRIBUTE}="${escapeHtml(JSON.stringify(value))}"`;

const renderPoll = (attrs) => {
  const poll = toBlogPoll(attrs);
  if (!poll) return "";
  // The question and options stay readable until the store hydrates it
  const options = poll.options
    .map((option) => `<li>${escapeHtml(option.label)}</li>`)
    .join("");
  const question = poll.question
    ? `<p class="zc-blog-poll__question">${escapeHtml(poll.question)}</p>`
    : "";
  return (
    `<div class="zc-blog-poll" ${BLOG_BLOCK_ATTRIBUTE}="${blogBlockEnum.POLL}"` +
    ` data-zc-poll-id="${escapeHtml(poll.pollId)}"${payloadAttr(poll)}>` +
    `${question}<ul class="zc-blog-poll__options">${options}</ul></div>`
  );
};

const renderRelatedPosts = (attrs) => {
  const related = toBlogRelatedPosts(attrs);
  if (!related) return "";
  return (
    `<div class="zc-blog-related" ${BLOG_BLOCK_ATTRIBUTE}="${blogBlockEnum.RELATED_POSTS}"` +
    `${payloadAttr(related)}></div>`
  );
};

const renderList = (node, depth) => {
  const tag = node.type === "orderedList" ? "ol" : "ul";
  const start = asPositiveNumber(node.attrs?.start);
  const startAttr = tag === "ol" && start && start > 1 ? ` start="${start}"` : "";
  const items = children(node)
    .map((item) => renderBlocks(children(item), depth + 1))
    .filter(Boolean)
    .map((inner) => `<li>${inner}</li>`)
    .join("");
  return items ? `<${tag}${startAttr}>${items}</${tag}>` : "";
};

const renderBlock = (node, depth) => {
  if (!node || depth > MAX_DEPTH) return "";
  const attrs = node.attrs ?? {};
  switch (node.type) {
    case "paragraph": {
      const inner = renderInlines(children(node), depth + 1).trim();
      return inner ? `<p>${inner}</p>` : "";
    }
    case "heading": {
      const level = asPositiveNumber(attrs.level) ?? 2;
      const tag = level <= 2 ? "h2" : "h3";
      const inner = renderInlines(children(node), depth + 1).trim();
      return inner ? `<${tag}>${inner}</${tag}>` : "";
    }
    case "blockquote": {
      const inner = renderBlocks(children(node), depth + 1);
      return inner ? `<blockquote>${inner}</blockquote>` : "";
    }
    case "bulletList":
    case "orderedList":
    case "taskList":
      return renderList(node, depth);
    case "codeBlock": {
      const text = children(node)
        .map((child) => child.text ?? "")
        .join("");
      if (!text) return "";
      const language = asString(attrs.language);
      const cls = CODE_LANGUAGE.test(language)
        ? ` class="language-${language}"`
        : "";
      return `<pre><code${cls}>${escapeHtml(text)}</code></pre>`;
    }
    case "horizontalRule":
      return "<hr />";
    case "hardBreak":
      return "<br />";
    case "image":
    case "imageBlock":
    case "imageUpload":
      return renderFigure(attrs);
    case "videoBlock":
      return renderVideo(attrs);
    case "embed":
      return renderEmbed(attrs);
    case "galleryBlock":
      return renderGallery(attrs);
    case "table":
      return renderTable(node, depth);
    case "details":
      return renderDetails(node, depth);
    case "htmlBlock":
      return renderHtmlBlock(attrs);
    case "poll":
      return renderPoll(attrs);
    case "relatedPosts":
      return renderRelatedPosts(attrs);
    case "text": {
      const inner = renderText(node).trim();
      return inner ? `<p>${inner}</p>` : "";
    }
    default: {
      // Unknown node: keep its text
      const content = children(node);
      if (!content.length) return "";
      if (content.every((child) => INLINE_TYPES.has(child.type ?? ""))) {
        const inner = renderInlines(content, depth + 1).trim();
        return inner ? `<p>${inner}</p>` : "";
      }
      return renderBlocks(content, depth + 1);
    }
  }
};

const renderBlocks = (nodes, depth) =>
  nodes.map((node) => renderBlock(node, depth)).join("");

// ─── API ────────────────────────────────────────────────────────────────────

/**
 * A post's `content` as safe HTML. Takes the TipTap document or its JSON
 * string. An HTML string (an old post) is run through `sanitizeHtml`, and
 * plain text becomes paragraphs.
 */
export const renderBlogContent = (
  input,
) => {
  const doc = parseBlogDoc(input);
  if (doc) return renderBlocks(children(doc), 0);
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return sanitizeHtml(trimmed);
  return trimmed
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br />")}</p>`)
    .join("");
};

const walk = (
  node,
  visit,
  depth = 0,
) => {
  if (!node || depth > MAX_DEPTH) return;
  visit(node);
  children(node).forEach((child) => walk(child, visit, depth + 1));
};

/**
 * The polls and related-posts blocks of a post, in document order, so a
 * page can load what they need on the server.
 */
export const getBlogBlocks = (
  input,
) => {
  const polls = [];
  const relatedPosts = [];
  const doc = parseBlogDoc(input);
  if (doc) {
    walk(doc, (node) => {
      if (node.type === "poll") {
        const poll = toBlogPoll(node.attrs);
        if (poll) polls.push(poll);
      } else if (node.type === "relatedPosts") {
        const related = toBlogRelatedPosts(node.attrs);
        if (related) relatedPosts.push(related);
      }
    });
  }
  return { polls, relatedPosts };
};

/** The post's words as plain text (read time, meta descriptions). */
export const blogContentToText = (
  input,
) => {
  const doc = parseBlogDoc(input);
  if (!doc) {
    return typeof input === "string"
      ? input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : "";
  }
  const parts = [];
  walk(doc, (node) => {
    // Marks split a word into several text nodes; only blocks separate words
    if (node.type === "text") parts.push(node.text ?? "");
    else if (node.type === "hardBreak" || !INLINE_TYPES.has(node.type ?? "")) {
      parts.push(" ");
    }
  });
  return parts.join("").replace(/\s+/g, " ").trim();
};
