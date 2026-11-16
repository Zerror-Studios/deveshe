/**
 * Blog post body: TipTap JSON → safe HTML (backend PRD-047 FR-10, FR-11).
 *
 * The kit's renderer and embed allowlist (`@zcom/storefront-kit/core`,
 * since kit 1.5.0). This store kept a local copy while it pinned kit 1.4.0;
 * it now pins 1.5.0, so this file only re-exports the kit's. Fix a
 * rendering bug in the kit, never here. `test/blog-content.test.mjs` pins
 * the output.
 */

export {
  BLOG_RELATED_POSTS_MAX_IDS,
  EMBED_IFRAME_ALLOW,
  EMBED_IFRAME_SANDBOX,
  blogBlockEnum,
  blogContentToText,
  getBlogBlocks,
  parseBlogDoc,
  readBlogBlock,
  renderBlogContent,
  toSafeEmbedSrc,
} from "@zcom/storefront-kit/core";
