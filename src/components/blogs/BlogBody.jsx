/**
 * The post body (backend PRD-047 FR-11): the kit renderer's HTML, parsed
 * through the store's sanitiser, with the block placeholders swapped for
 * components:
 * - `poll` → `BlogPoll` (client: radio group, vote, results bars);
 * - `related-posts` → the chosen posts as `BlogGridCard`s, in the
 *   merchant's order, or the automatic related posts when none were chosen
 *   (D5). The page loads both on the server (`loadBlogPost`).
 *
 * Server component: only the poll hydrates.
 */

import React from "react";

import BlogPoll from "@/components/blogs/BlogPoll";
import BlogGridCard from "@/components/common/card/BlogGridCard";
import { blogBlockEnum, readBlogBlock } from "@/utils/kit-blog-content.util";
import { pickRelatedPosts } from "@/utils/blog-blocks.util";
import { parseSafeHtml } from "@/utils/sanitize-html.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

const DEFAULT_RELATED_TITLE = "Read also";

function RelatedPostsBlock({ title, posts }) {
  if (!posts.length) return null;
  return (
    <section className="blog-related-block">
      <h2 className="blog-related-block__heading">
        {title || DEFAULT_RELATED_TITLE}
      </h2>
      <div className="blog-related-block__grid">
        {posts.map((post) => (
          <BlogGridCard key={post._id || post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

// ─── Component ────────────────────────────────────────────────────────────

export default function BlogBody({ html, slug, related }) {
  const replace = (node) => {
    if (node.type !== "tag" || node.name !== "div") return undefined;
    const block = readBlogBlock(node.attribs);
    if (!block) return undefined;
    if (block.type === blogBlockEnum.POLL) {
      return <BlogPoll blogSlug={slug} poll={block} />;
    }
    const posts = pickRelatedPosts(block, related || {});
    return posts.length ? (
      <RelatedPostsBlock title={block.title} posts={posts} />
    ) : (
      <></>
    );
  };

  return (
    <div className="blog-post__body">{parseSafeHtml(html, { replace })}</div>
  );
}
