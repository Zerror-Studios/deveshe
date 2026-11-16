# PRD-045 — Merchandising order and desktop + mobile banners (pointer)

| Field | Value |
|---|---|
| Status | **Implemented** 2026-11-16 (this repo's part of FR-4 and FR-7); released to `dev`, `uat` and `main` on kit **v1.4.0** the same day (owner); not browser-tested |
| Source-of-truth PRD | [`../../../../zcom-backend/docs/prd/PRD-045-merchandising-order-and-banners.md`](../../../../zcom-backend/docs/prd/PRD-045-merchandising-order-and-banners.md) |
| Approved by / on | Anand (owner), backend PRD-045 |
| Needs | Kit **1.4.0** for the data (its `GetCategories` selects `banner`, its `GetBlog` `assetMobile`); until the pin moves, the pages read the fields defensively and show the desktop image (`package.json` unchanged). The kit's 1.4.0 documents need the backend's PRD-045 deploy first |

This file holds only Deveshe Dreams' notes. Requirements, contract and decisions are in the backend PRD.

## As built

- **Collection order (D2).** `/shop/[categories]` reads the category's products with no `sort` (`fetchProductPage`, `utils/catalog-listing.util.js` drops the default), so a list of one collection follows the merchant's order; the shop's client filters don't re-sort. Nothing changed in code for this. `/shop` lists the curated collection the same way.
- **Banners and covers (FR-7)**, mobile image up to 768 px (the store's breakpoint), one download each:
  - `components/common/ResponsivePicture.jsx` for the GSAP-animated `<img>` heroes: the same `<img>` and ref, wrapped in a `<picture class="responsive_picture">` (`display: contents`) only when there is a mobile image. Used by the shop collection hero (`components/shop/HeroSection.jsx`: `banner.desktop` / `banner.mobile`, else `imgsrc`, else the shop's own cover) and the lookbook hero (`LookBookHero`: `cover`, `coverMobile`, else the cover's own `mobile`).
  - `components/common/ResponsiveHeroImage.jsx` for the blog post hero (`next/image` + `getImageProps`; `post.imageMobile` from `assetMobile` in `data/blogs.js` `mapBlogForDetail`). The visible image keeps `priority` and gets `fetchPriority="high"`.
- **Focal point.** `focalPoint` (banner) and `focalX` / `focalY` (lookbook) become `--hero-pos-desktop` / `--hero-pos-mobile`, applied as `object-position` per breakpoint by `img.responsive_hero_img` (`styles/globals.css`). Blog covers have no focal point. `crop` (second pass, 2026-11-16) becomes `--hero-view-*` / `--hero-viewpos-*` (`toHeroImageStyle`): inside `@supports (object-view-box: inset(0%))` the hero shows only the crop, with the focal point placed inside it; browsers without `object-view-box` (Safari, Firefox today) keep the whole image centred on the focal point, else the crop's centre. A desktop crop never reaches a separate mobile image.
- **Pairs.** `utils/responsive-image.util.js` (`getCategoryBanner`, `getLookbookCover`, `toObjectPosition`), tested in `test/responsive-image.test.mjs`; the Nahara twin is `utils/responsive-image.js`.
- **Product cards (FR-4).** `ProductGridCard` (curated grids, shop, search, lookbooks) and `ProductListGrid` (similar products) show the featured image, else the first, skipping videos (the kit's `getFeaturedImage`).
- **Sort select (second pass, owner approved 2026-11-16).** From kit 1.4.0 the select's default is "Featured" (`FEATURED`, the collection's own order, never sent to the API) and "Newest" is an explicit `?sort=NEWEST`; the store needs no code change, only the kit pin. `test/listing-sort.test.mjs` is written against `DEFAULT_LISTING_SORT`, so it passes on 1.3.0 and 1.4.0.

## Open

- Browser check on a phone and a desktop width once the backend is deployed and the kit pinned at `v1.4.0`.
