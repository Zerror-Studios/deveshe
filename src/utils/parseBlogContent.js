function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyMarks(text, marks = []) {
  let out = escapeHtml(text);
  if (!marks.length) return out;

  const sorted = [...marks].sort((a, b) => {
    const order = { link: 3, bold: 2, italic: 1 };
    return (order[b.type] || 0) - (order[a.type] || 0);
  });

  sorted.forEach((mark) => {
    switch (mark.type) {
      case "bold":
        out = `<strong>${out}</strong>`;
        break;
      case "italic":
        out = `<em>${out}</em>`;
        break;
      case "strike":
        out = `<s>${out}</s>`;
        break;
      case "underline":
        out = `<u>${out}</u>`;
        break;
      case "code":
        out = `<code>${out}</code>`;
        break;
      case "link": {
        const href = mark.attrs?.href || "#";
        const target = mark.attrs?.target || "_blank";
        const rel = target === "_blank" ? ' rel="noopener noreferrer"' : "";
        out = `<a href="${escapeHtml(href)}" target="${escapeHtml(target)}"${rel}>${out}</a>`;
        break;
      }
      default:
        break;
    }
  });

  return out;
}

function inlineToHtml(node) {
  if (!node) return "";

  switch (node.type) {
    case "text":
      return applyMarks(node.text || "", node.marks);
    case "hardBreak":
      return "<br />";
    case "image":
    case "imageBlock":
      return imageNodeToHtml(node);
    default:
      if (getImageAttrs(node).src) {
        return imageNodeToHtml(node);
      }
      if (Array.isArray(node.content)) {
        return node.content.map(inlineToHtml).join("");
      }
      return "";
  }
}

function getImageAttrs(node) {
  const attrs = node?.attrs || {};
  const src =
    attrs.src ||
    attrs.path ||
    attrs.url ||
    attrs.asset?.path ||
    "";

  const alt = attrs.alt || attrs.altText || attrs.title || "";

  return { src, alt, widthPx: attrs.widthPx, heightPx: attrs.heightPx };
}

function imageNodeToHtml(node) {
  const { src, alt, widthPx, heightPx } = getImageAttrs(node);
  if (!src) return "";

  const aspectStyle =
    widthPx && heightPx
      ? ` style="aspect-ratio: ${widthPx} / ${heightPx};"`
      : "";

  return `<figure class="blog-post__figure"><div class="blog-post__figureMedia"${aspectStyle}><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="blog-post__figureImage" loading="lazy" /></div></figure>`;
}

function blockToHtml(node) {
  if (!node) return "";

  switch (node.type) {
    case "paragraph": {
      const inner = (node.content || []).map(inlineToHtml).join("").trim();
      return inner ? `<p>${inner}</p>` : "";
    }
    case "heading": {
      const level = Math.min(Math.max(node.attrs?.level || 2, 2), 3);
      const tag = level === 2 ? "h2" : "h3";
      const inner = (node.content || []).map(inlineToHtml).join("");
      return inner ? `<${tag}>${inner}</${tag}>` : "";
    }
    case "blockquote": {
      const inner = (node.content || []).map(blockToHtml).join("");
      return inner ? `<blockquote>${inner}</blockquote>` : "";
    }
    case "bulletList":
    case "orderedList": {
      const tag = node.type === "orderedList" ? "ol" : "ul";
      const items = (node.content || [])
        .map((item) => {
          const inner = (item.content || []).map(blockToHtml).join("");
          return inner ? `<li>${inner}</li>` : "";
        })
        .filter(Boolean)
        .join("");
      return items ? `<${tag}>${items}</${tag}>` : "";
    }
    case "listItem":
      return (node.content || []).map(blockToHtml).join("");
    case "horizontalRule":
      return "<hr />";
    case "image":
    case "imageBlock":
    case "imageUpload":
      return imageNodeToHtml(node);
    case "codeBlock": {
      const text = (node.content || [])
        .map((n) => n.text || "")
        .join("\n");
      return text ? `<pre><code>${escapeHtml(text)}</code></pre>` : "";
    }
    case "hardBreak":
      return "<br />";
    default: {
      if (getImageAttrs(node).src) {
        return imageNodeToHtml(node);
      }
      if (Array.isArray(node.content)) {
        return node.content.map(blockToHtml).join("");
      }
      return "";
    }
  }
}

export function tiptapDocToHtml(doc) {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) return "";
  return doc.content.map(blockToHtml).filter(Boolean).join("");
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
