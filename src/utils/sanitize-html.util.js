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
 */
import { domToReact, htmlToDOM } from "html-react-parser";

// ─── Allowlists ───────────────────────────────────────────────────────────

/** Removed together with their content. */
const DROP_TAGS = new Set([
  "script",
  "style",
  "iframe",
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
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "small",
  "span",
  "strong",
  "sub",
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
]);

const GLOBAL_ATTRIBUTES = new Set(["class", "title", "lang", "dir", "style"]);

const TAG_ATTRIBUTES = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  ol: new Set(["start"]),
};

const URL_ATTRIBUTES = new Set(["href", "src"]);
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

  node.attribs = sanitizeAttributes(tagName, node.attribs);
  node.children = sanitizeNodes(node.children, node);
  node.parent = parent;
  return [node];
}

// ─── API ──────────────────────────────────────────────────────────────────

/** Sanitised React elements for an HTML string. */
export const parseSafeHtml = (html = "") => {
  if (!html) return "";
  const nodes = sanitizeNodes(htmlToDOM(String(html)));
  return domToReact(nodes);
};
