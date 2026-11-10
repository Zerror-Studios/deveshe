/**
 * Plain text from tenant HTML, for meta descriptions (never rendered as
 * HTML). Pure, so server pages and tests can use it.
 */

export const htmlToPlainText = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
