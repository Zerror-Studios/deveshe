# ADR-001 — Move the storefront to the Next.js App Router

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-11 |
| Deciders | Owner (kit PRD-002 D4, D7, D11) |
| Related | Kit PRD-002 (`../../../../zcom-storefront-kit/docs/prd/PRD-002-storefronts-onto-the-kit.md`, FR-3.1–3.5), pointer `../prd/KIT-PRD-002-storefronts-onto-the-kit.md`, backend ADR-010 (the storefront kit) |

## Context
This storefront was the only Zcom store on the Pages Router (`getServerSideProps`, `next/router`, `next/head`), on Next 15 and React 18. Nahara and every new store use the App Router, and `@zcom/storefront-kit` 1.x targets it (server readers, `ZcomSsrProvider`, the proxy, React 19 peers). `CLAUDE.md` §3 made the router move an ADR-level decision. The owner decided to move Deveshe Dreams to the App Router first, on Next 16, and then onto the kit (kit PRD-002 D4, D7), and started this step on 2026-11-11 (D11).

## Options considered
1. **Stay on the Pages Router and adapt the kit to it**: the kit would need a second set of server helpers and a Pages provider, and React 18 would block the shared package versions (D3).
2. **Move straight onto the kit in one change**: router, React 19, three/r3f majors and the plumbing swap together; any regression would be hard to place.
3. **Move to the App Router on the current plumbing, then onto the kit** (chosen, FR-3.5): one change of routing and packages with the store's own data, session and checkout code unchanged, verified on its own.

## Decision
Option 3. Every route moves to `src/app` with the same URLs:
- each `getServerSideProps` becomes a server-only loader in `src/lib/page-data/*.server.js` (same code, same `{ props } | { notFound }`), read once per request through React `cache()` by `generateMetadata` and the page, which is `dynamic = "force-dynamic"`;
- the meta objects become `generateMetadata` / `metadata` (`lib/seo-metadata.util.js`) and the JSON-LD a server component in the page (`components/seo/PageSchemas.jsx`);
- the page components become client views (`src/views/*View.jsx`) on `next/navigation`;
- `_app` / `_document` / `_error` / `404` become `app/layout.jsx` + `components/layouts/Providers.jsx`, `error`, `global-error` and `not-found`;
- `middleware.js` becomes `proxy.js` (Next 16);
- server reads use `lib/server-apollo.server.js`, never the browser client.

Packages move to the shared version table (D3): Next 16.4, React 19.3, Apollo Client 4.3, graphql 17.1, three 0.187, r3f 9.8, drei 10.7, lenis 1.3 (replacing `@studio-freight/lenis` + tempus), Swiper 14, html-react-parser 6, @hookform/resolvers 7. `react-modal` (unused) and `react-outside-click-handler` (React ≤ 16 only) are removed.

## Consequences
- Easier: the kit move (step 5) is now a swap of plumbing, not of routing; one React and Next version across the kit and both stores.
- A page that fails on the server shows the branded error page after the browser loads (App Router error boundaries are client components); the status code stays 500.
- `router.push` no longer returns a promise: code after a navigation runs at once.
- Same-page `#hash` links don't re-run the navbar intro effects (they key on the pathname); the home page still scrolls to the anchor.
- `npm run lint` (`next lint`) no longer exists in Next 16; the repo still has no ESLint setup.
- Follow-up: step 5 (the kit), then the FR-6.2 checks (live check, browser pass) for both steps.
