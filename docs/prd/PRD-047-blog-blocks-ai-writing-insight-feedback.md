# PRD-047 — Blog editor blocks, AI writing and insight feedback (pointer)

| Field | Value |
|---|---|
| Status | **Implemented** 2026-11-17 (this repo's part: FR-10 use, FR-11); working tree on `microservice`, not committed, not browser-tested |
| Source-of-truth PRD | [`../../../../zcom-backend/docs/prd/PRD-047-blog-blocks-ai-writing-insight-feedback.md`](../../../../zcom-backend/docs/prd/PRD-047-blog-blocks-ai-writing-insight-feedback.md) |
| Approved by / on | Anand (owner), backend PRD-047 (2026-11-17) |
| Needs | The backend's PRD-047 fields (`voteBlogPoll`, `blogPollResults`, `getClientSideRelatedBlogs`, `BlogsFilterInput.ids`) deployed first. Works on kit 1.4.0 through local copies (below); kit 1.5.0 replaces them |

This file holds only Deveshe Dreams's notes. Requirements, contract and decisions are in the backend PRD. AI writing and insight feedback are dashboard-only.

## As built

- **Post body:** `utils/parseBlogContent.js` `tiptapDocToHtml` now calls the kit renderer `renderBlogContent` (D2), replacing the store's own converter, which lost table structure and rendered nothing for galleries, embeds, videos and related posts. The duplicate-intro rule and the static sample posts are unchanged.
- **Until kit 1.5.0:** the store pins kit v1.4.0, which has no renderer, so `utils/kit-blog-content.util.js` is a types-stripped copy of the kit's `blog-content.util.ts` and `embed-url.util.ts` (output checked identical to the kit build on 2026-11-17); its `htmlBlock` uses 1.4.0's `sanitizeHtml`, which doesn't keep `details`/`summary`/`mark` yet. The three new documents are local too (`GetRelatedBlogs`, `GetBlogPollResults` in `graphql/queries/blogs.gql.jsx`, `VoteBlogPoll` in `graphql/mutations/blog-poll.mutation.jsx`, same names as the kit's), and `next.config.mjs` adds the embed providers to `frame-src` (`withBlogEmbedFrames`, a no-op once the kit's CSP has them). **Switch on pinning 1.5.0:** replace `kit-blog-content.util.js` with re-exports from `@zcom/storefront-kit/core` (list in its header), re-export the three documents from the kit (`test/kit-documents.test.mjs` flags them), drop them from `STORE_DOCUMENTS`, and remove `withBlogEmbedFrames`.
- **Sanitiser** (`utils/sanitize-html.util.js`): keeps `details`, `summary` (`open`), `mark`, `video` (`src`, `controls`, `preload`, `playsinline`, `poster`), the placeholders' `data-zc-block` / `data-zc-payload` / `data-zc-poll-id` on `div`, and an `iframe` only when `toSafeEmbedSrc(src)` passes, rebuilt with our own `sandbox`, `allow`, `loading` and `referrerpolicy`. `parseSafeHtml(html, { replace })` passes html-react-parser's `replace` on.
- **Blocks on the post page** (`components/blogs/BlogBody.jsx`, server component):
  - **Poll** → `BlogPoll.jsx` (client): the question, a native radio group (fieldset + visually hidden legend) and a Vote button; after voting, bars with percentages, "(your vote)" and the total in a polite live region. One vote per browser: `zc_poll_voter` cookie (random UUID, one year, `SameSite=Lax`, `Secure` on https; `utils/blog-blocks.util.js`), the choice remembered in `localStorage` `zcom:poll:<pollId>` (the kit's key) so results show again on return. Votes through the kit's `/v1/graphql` proxy. `POLL_CLOSED` shows the results, `RATE_LIMITED` and `POLL_NOT_FOUND` show copy; a poll past `closesAt` is disabled and loads its results.
  - **Related posts** → the chosen posts in the merchant's order as `BlogGridCard`s (loaded on the server in one `getClientSideBlogs(filter: { ids })` call), or the automatic list when none were chosen (D5); heading = the block's title, else "Read also".
  - **Tables** scroll sideways in `.zc-blog-table` (min width 480 px); **details** are native with a +/− marker; **galleries** are a figure grid, `slider` a scroll-snap strip; **embeds** 16:9 (Instagram, X, Facebook 4:5); **HTML blocks** render their sanitised markup. Styles in `styles/components/blogs/blog-post.css` ("Blog blocks").
- **Bottom "Read also"** (`lib/page-data/blog.server.js`): `getClientSideRelatedBlogs(slug, 4)` (FR-9) instead of the latest five; while the backend lacks FR-9 the query fails and the latest posts are used. It is left out when the body has an automatic related-posts block, so the same cards don't show twice.
- **Tests:** `test/blog-content.test.mjs` (12: tables, details, gallery/video/embed, `htmlBlock` safety, intro dedupe, iframe allowlist, placeholder attributes, the `replace` hook, related-post picking, the voter cookie, results bars, close date). `npm test` 173/173.

## Open

- Browser check of each block once the backend and dashboard ship (PRD §9 definition of done).
- Pin kit 1.5.0 and do the switch above.
- The backend's `validate:clients` manifest for this store needs `--write` in the backend repo (3 new operations).
