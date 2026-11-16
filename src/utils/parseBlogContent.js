/**
 * Blog `content` (stringified TipTap JSON from the dashboard, an old HTML
 * post, or the static sample blocks) → what `BlogPostDetail` renders.
 * Rendering itself is the kit's (`utils/kit-blog-content.util.js` until the
 * store pins kit 1.5.0).
 */
import { renderBlogContent } from "@/utils/kit-blog-content.util";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A TipTap document as safe HTML: the kit's `renderBlogContent` (backend
 * PRD-047 FR-11; the store's own converter it replaced lost tables and
 * rendered no gallery, embed, video or related-posts block).
 */
export function tiptapDocToHtml(doc) {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) return "";
  return renderBlogContent(doc);
}

function normalizeText(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function getParagraphText(node) {
  if (node?.type !== "paragraph") return "";

  return (node.content || [])
    .filter((n) => n.type === "text")
    .map((n) => n.text || "")
    .join("");
}

function textsMatch(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return false;

  return left === right || left.startsWith(right) || right.startsWith(left);
}

function stripDuplicateIntroParagraph(doc, excerpt) {
  if (!doc?.content?.length || !excerpt) return doc;

  const firstText = getParagraphText(doc.content[0]);
  if (!textsMatch(firstText, excerpt)) return doc;

  return { ...doc, content: doc.content.slice(1) };
}

function isStaticContentBlocks(content) {
  return (
    Array.isArray(content) &&
    content.length > 0 &&
    ["paragraph", "heading", "image"].includes(content[0]?.type)
  );
}

function parseContentInput(content) {
  if (content == null || content === "") return null;

  if (typeof content === "object" && content.type === "doc") {
    return content;
  }

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("<")) return { html: trimmed };

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed?.type === "doc") return parsed;
      if (typeof parsed === "string") return parseContentInput(parsed);
    } catch {
      return { html: `<p>${escapeHtml(trimmed)}</p>` };
    }
  }

  return null;
}

export function normalizeBlogContent(content, excerpt) {
  if (isStaticContentBlocks(content)) {
    return { contentHtml: null, content };
  }

  const parsed = parseContentInput(content);

  if (!parsed) {
    return { contentHtml: null, content: null };
  }

  if (parsed.html) {
    return { contentHtml: parsed.html, content: null };
  }

  const doc = excerpt
    ? stripDuplicateIntroParagraph(parsed, excerpt)
    : parsed;

  return {
    contentHtml: tiptapDocToHtml(doc),
    content: null,
  };
}

export function getBlogContentPlainText(content) {
  const { contentHtml } = normalizeBlogContent(content);

  if (contentHtml) {
    return contentHtml.replace(/<[^>]+>/g, " ");
  }

  if (isStaticContentBlocks(content)) {
    return content
      .map((block) => {
        if (block.type === "paragraph" || block.type === "heading") {
          return block.text || "";
        }
        return "";
      })
      .join(" ");
  }

  if (typeof content === "string") {
    return content.replace(/<[^>]+>/g, " ");
  }

  return "";
}
