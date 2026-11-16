/**
 * Allowlist HTML sanitiser for CMS content (PRD-002 SF-10).
 *
 * Product and lookbook descriptions are rich text from the dashboard. They
 * are parsed into a DOM tree (`htmlToDOM`, server-safe), cleaned here, and
 * only then turned into React elements, so no script, event handler or
 * `javascript:` URL reaches the page. No dependencies.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/sanitize-html.js`
 * and `zcom-backend/packages/core/src/utils/sanitize-html.ts` (PRD-002
 * RMAINT-7; a shared package is an ADR-level decision).
 *
 * Blog bodies (backend PRD-047 FR-11): `details`, `summary`, `mark` and
 * `video` are kept, the blog block placeholders keep their `data-zc-*`
 * attributes (the post page swaps them for components through `replace`),
 * and an `iframe` survives only with an allowlisted embed `src`
 * (`toSafeEmbedSrc`), always sandboxed. Rare has no blog, so these
 * additions aren't mirrored there.
 */
import { domToReact, htmlToDOM } from "html-react-parser";
import {
  EMBED_IFRAME_ALLOW,
  EMBED_IFRAME_SANDBOX,
  toSafeEmbedSrc,
} from "@/utils/kit-blog-content.util";

// ─── Allowlists ───────────────────────────────────────────────────────────

/** Removed together with their content. */
const DROP_TAGS = new Set([
  "script",
  "style",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "link",
  "meta",
  "base",
  "svg",
  "math",
  "template",
  "noscript",
]);

/** Kept; any other tag is unwrapped (its children stay). */
const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "details",
  "div",
  "em",
  // Blog image blocks (`utils/parseBlogContent.js`)
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  // Blog embeds only, with an allowlisted src (`sanitizeIframe`)
  "iframe",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
  "video",
]);

const GLOBAL_ATTRIBUTES = new Set(["class", "title", "lang", "dir", "style"]);

const TAG_ATTRIBUTES = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  ol: new Set(["start"]),
  details: new Set(["open"]),
  // Blog block placeholders (`renderBlogContent`, PRD-047)
  div: new Set(["data-zc-block", "data-zc-payload", "data-zc-poll-id"]),
  video: new Set(["src", "controls", "preload", "playsinline", "poster"]),
};

const URL_ATTRIBUTES = new Set(["href", "src", "poster"]);
const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];
// A backslash can hide any of these behind a CSS escape (RSEC-11).
const UNSAFE_STYLE =
  /expression|url\s*\(|javascript:|vbscript:|@import|behavior|-moz-binding|\\/i;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Relative URLs and http(s)/mailto/tel only. */
export const isSafeUrl = (value = "") => {
  // eslint-disable-next-line no-control-regex
  const url = String(value).replace(/[\u0000-\u0020\u007f-\u009f]/g, "");
  const schemeMatch = url.match(/^([a-z][a-z0-9+.-]*:)/i);
  if (!schemeMatch) return true;
  return SAFE_URL_SCHEMES.includes(schemeMatch[1].toLowerCase());
};

const sanitizeAttributes = (tagName, attribs = {}) => {
  const allowedForTag = TAG_ATTRIBUTES[tagName];
  const clean = {};

  Object.entries(attribs).forEach(([rawName, value]) => {
    const name = rawName.toLowerCase();
    const isAllowed =
      GLOBAL_ATTRIBUTES.has(name) || Boolean(allowedForTag?.has(name));
    if (!isAllowed) return;
    if (URL_ATTRIBUTES.has(name) && !isSafeUrl(value)) return;
    if (name === "style" && UNSAFE_STYLE.test(value)) return;
    clean[name] = value;
  });

  // Any target (not only _blank) can give the new page `window.opener`.
  if (tagName === "a" && clean.target) {
    clean.rel = "noopener noreferrer";
  }
  return clean;
};

const isElementNode = (node) =>
  node.type === "tag" || node.type === "script" || node.type === "style";

const sanitizeNodes = (nodes = [], parent = null) =>
  nodes.flatMap((node) => sanitizeNode(node, parent));

function sanitizeNode(node, parent) {
  if (node.type === "text") {
    node.parent = parent;
    return [node];
  }
  if (!isElementNode(node)) return [];

  const tagName = String(node.name || "").toLowerCase();
  if (DROP_TAGS.has(tagName)) return [];

  if (!ALLOWED_TAGS.has(tagName)) {
    return sanitizeNodes(node.children, parent);
  }
  if (tagName === "iframe") return sanitizeIframe(node, parent);

  node.attribs = sanitizeAttributes(tagName, node.attribs);
  node.children = sanitizeNodes(node.children, node);
  node.parent = parent;
  return [node];
}

/**
 * An embed iframe: kept only when its `src` is an allowlisted provider (the
 * rebuilt URL replaces it), with our own sandbox and policy, never the
 * content's; anything else is dropped with its content.
 */
function sanitizeIframe(node, parent) {
  const src = toSafeEmbedSrc(node.attribs?.src);
  if (!src) return [];
  node.attribs = {
    src,
    title: node.attribs?.title || "Embedded content",
    sandbox: EMBED_IFRAME_SANDBOX,
    allow: EMBED_IFRAME_ALLOW,
    loading: "lazy",
    referrerpolicy: "strict-origin-when-cross-origin",
    allowfullscreen: "",
  };
  node.children = [];
  node.parent = parent;
  return [node];
}

// ─── API ──────────────────────────────────────────────────────────────────

/**
 * Sanitised React elements for an HTML string. `options.replace` is
 * html-react-parser's: it sees the sanitised nodes only (the blog body swaps
 * its placeholders for components with it).
 */
export const parseSafeHtml = (html = "", options = {}) => {
  if (!html) return "";
  const nodes = sanitizeNodes(htmlToDOM(String(html)));
  return options.replace
    ? domToReact(nodes, { replace: options.replace })
    : domToReact(nodes);
};
