# KIT-PRD-002 — Move Deveshe Dreams and Nahara onto the kit (pointer to the kit's PRD-002)

| Field | Value |
|---|---|
| Status | **Approved** 2026-11-10 (owner) · step 4 (Deveshe to the App Router) **implemented in the working tree** 2026-11-11 (D11: started before step 3's browser checks) |
| Source-of-truth PRD | `../../../../zcom-storefront-kit/docs/prd/PRD-002-storefronts-onto-the-kit.md` (the kit repo; it changes no backend contract, backend ADR-010) |
| Repos affected | zcom-storefront-kit · storefronts/rare-element · storefronts/deveshe-dreams (this repo) · zcom-backend (client manifests only) |

This repo keeps only Deveshe Dreams' notes. Decisions D1–D11, the gap review and the requirements are in the source PRD; the routing decision is `../adr/ADR-001-app-router.md`.

## Deveshe Dreams (step 4: App Router, on the store's own plumbing, FR-3.1–3.5)

**Routes (FR-3.1, all URLs unchanged):** every `src/pages` file moved to `src/app`:
- the data pages (`/`, `/products`, `/category/[slug]`, `/search`, `/product/[slug]`, `/pay/[token]`) read through server-only loaders in `src/lib/page-data/*.server.js` (the old `getServerSideProps` code), once per request (`cache()`), `dynamic = "force-dynamic"`; an unknown slug is still a 404;
- the meta objects became `generateMetadata` / `metadata` (`lib/seo-metadata.util.js`, the tags `SeoHeader` wrote) and the JSON-LD `components/seo/PageSchemas.jsx`;
- the page components are client views in `src/views/`;
- `/sitemap.xml`, `/robots.txt` and `/api/payments/return` are route handlers with the same output and headers (the return keeps a relative `Location`);
- `/pay/*` gets `X-Robots-Tag` and `Referrer-Policy: no-referrer` from `next.config.mjs`; Next's own private, no-store Cache-Control replaces the hand-set one.

**Shell (FR-3.2):** `app/layout.jsx` (Consent Mode defaults in `<head>`, the global CSS) + `components/layouts/Providers.jsx` (Apollo, auth, layout, Lenis, toasts, attribution, Pixel PageView per navigation); `not-found`, `error`, `global-error`.

**Navigation (FR-3.3):** `next/router` → `next/navigation`: `useSearchParams` (Suspense on the static pages that read it), `usePathname` effects for the Pixel, the hash scroll and the navbars; the token pages read the link once from `window.location` and drop it with `history.replaceState` (shallow, as before). `middleware.js` → `proxy.js` (Next 16). Server reads use `lib/server-apollo.server.js`.

**Packages (FR-3.4, D3, D7):** Next 16.4.6, React 19.3.1, Apollo Client 4.3.8, graphql 17.1, three 0.187, r3f 9.8.2, drei 10.7.9, lenis 1.3.27 (was `@studio-freight/lenis` + tempus; the options 1.0.42 actually applied are kept), Swiper 14.4, html-react-parser 6.1, @hookform/resolvers 7.0, react-hook-form 7.91, zod 4.6, zustand 5.1, react-toastify 11.2, react-international-phone 4.8, react-icons 5.7; `react-modal` (unused) and `react-outside-click-handler` (React ≤ 16; replaced by a small effect in `ModalComponent`) removed. `nimbbl_sonic` stays until step 5 (the kit's payment launcher).

**Checks (2026-11-11):** `npm run build` (129/129 tests, every route, Next 16 + Turbopack); no edge secret in `.next/static`; `next start` smoke test without a backend (status codes, metadata and JSON-LD, consent script in `<head>`, CSP, the `/pay` headers, the login guard, the payment return, `/.well-known/zcom-store`, robots) and the `/v1/graphql` proxy against a local echo gateway (tenant and edge headers, right-most client IP, forged `x-zcom-store` and `Origin` dropped); backend `validate:clients` 58/58 operations.

**Not run yet (FR-6.2, owner):** the kit's `zcom-live-check` against a running backend and the manual browser pass, which also covers the library majors (three 0.187 / r3f 9 contact scene, Swiper 14, html-react-parser 6, lenis 1.3) and the GSAP pages.

**Next:** step 5, Deveshe Dreams onto the kit (FR-4.x).
