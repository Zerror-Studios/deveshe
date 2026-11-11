/**
 * Lookbook rendering rules (backend PRD-027 §6, storefront contract).
 *
 * - Below 768 px a look uses its `mobile` image and `mobileHotspots` when it
 *   has them; otherwise the desktop image shows without dots (they would be
 *   smaller than 24 px) and the look's product strip lists every tagged
 *   product instead.
 * - Hotspot `x` / `y` are fractions of the image (0–1).
 * - A look's strip is its "shop this look" products plus any product only
 *   tagged on a hotspot, each once; unpublished products (null) are left out.
 * - A CTA link is a relative path or an `https://` URL; anything else is
 *   dropped (the backend refuses other schemes, this is belt and braces).
 *
 * Pure functions, no imports, so `node:test` loads them directly.
 *
 * Keep in sync with `storefronts/rare-element/src/utils/lookbook.js`.
 */

// ─── Constants ────────────────────────────────────────────────────────────

/** Below this width the mobile rules apply (PRD-027 §6). */
export const LOOKBOOK_MOBILE_MAX_WIDTH_PX = 767;

export const LookLayoutEnum = Object.freeze({
  FULL_BLEED: "FULL_BLEED",
  SPLIT: "SPLIT",
  GRID: "GRID",
  TEXT: "TEXT",
  VIDEO: "VIDEO",
});

const SAFE_RELATIVE_PATH = /^\/(?!\/)/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f\\]/;

// ─── Helpers ──────────────────────────────────────────────────────────────

const clampFraction = (value) =>
  Math.min(1, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));

/** The looks in their `position` order. */
export const sortLooks = (looks = []) =>
  [...(looks || [])].sort(
    (a, b) => (Number(a?.position) || 0) - (Number(b?.position) || 0),
  );

/**
 * The image to show for `media` and whether its dots show:
 * `{ url, width, height, alt, hotspots, showDots }`. VIDEO items return
 * their URL and poster with no dots.
 */
export const pickLookMedia = (media, isMobile = false) => {
  if (!media?.url) return null;
  const useMobile = Boolean(isMobile && media.mobile?.url);
  const source = useMobile ? media.mobile : media;
  const hotspots = (useMobile ? media.mobileHotspots : media.hotspots) || [];
  return {
    type: media.type || "IMAGE",
    url: source.url,
    width: Number(source.width) || null,
    height: Number(source.height) || null,
    alt: media.alt || "",
    posterUrl: media.posterUrl || null,
    // A phone without a mobile image gets the strip instead of tiny dots
    showDots: media.type !== "VIDEO" && (!isMobile || useMobile),
    hotspots: hotspots
      .filter((spot) => spot?.product)
      .map((spot) => ({
        ...spot,
        x: clampFraction(spot.x),
        y: clampFraction(spot.y),
      })),
  };
};

/** Every product of a look once: its strip first, then hotspot-only ones. */
export const lookProducts = (look) => {
  const seen = new Set();
  const products = [];
  const add = (product) => {
    if (!product?._id || seen.has(product._id)) return;
    seen.add(product._id);
    products.push(product);
  };
  (look?.products || []).forEach((tag) => add(tag?.product));
  (look?.media || []).forEach((media) => {
    (media?.hotspots || []).forEach((spot) => add(spot?.product));
    (media?.mobileHotspots || []).forEach((spot) => add(spot?.product));
  });
  return products;
};

/** The lookbook's featured products (unpublished ones left out). */
export const featuredProducts = (lookbook) =>
  (lookbook?.featuredProducts || [])
    .map((tag) => tag?.product)
    .filter((product) => product?._id);

/** `href` when it is a relative path or an https URL, else null. */
export const toSafeCtaHref = (href) => {
  const value = typeof href === "string" ? href.trim() : "";
  if (!value || CONTROL_CHARS.test(value)) return null;
  if (SAFE_RELATIVE_PATH.test(value)) return value;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
};

// ─── Chapter layout (the live site's lookbook design) ───────────────────

/**
 * The live design has seven fixed slots after the products: video,
 * banner, one image, two images, image + scrolling image (the legacy
 * `sections[0..6]`, migrated in order into looks, PRD-027 FR-9).
 */
export const CHAPTER_SLOT_COUNT = 7;

const CHAPTER_LAYOUTS = new Set([
  LookLayoutEnum.VIDEO,
  LookLayoutEnum.FULL_BLEED,
  LookLayoutEnum.TEXT,
]);

/** A look the chapter slots can show without losing anything. */
const isChapterLook = (look) =>
  CHAPTER_LAYOUTS.has(look?.layout) &&
  (look?.media || []).length <= 1 &&
  !look?.heading &&
  !look?.cta &&
  !(look?.products || []).length &&
  !(look?.media || []).some(
    (item) => (item?.hotspots || []).length || (item?.mobileHotspots || []).length,
  );

/** A look as a legacy section: `{ imageUrl, videourl, paragraph }`. */
export const lookToSection = (look) => {
  const media = (look?.media || [])[0];
  const isVideo = media?.type === "VIDEO";
  return {
    imageUrl: (isVideo ? media?.posterUrl : media?.url) || "",
    videourl: isVideo ? media?.url || "" : "",
    paragraph: look?.body || "",
  };
};

/**
 * The lookbook's looks as the seven chapter sections, or null when a look
 * needs the flexible layout (hotspots, tagged products, a CTA, a heading,
 * SPLIT/GRID, or more looks than slots): those lookbooks were built in the
 * dashboard and keep `LookSection`.
 */
export const toChapterSections = (looks = []) => {
  const sorted = sortLooks(looks);
  if (!sorted.length || sorted.length > CHAPTER_SLOT_COUNT) return null;
  if (!sorted.every(isChapterLook)) return null;
  return sorted.map(lookToSection);
};
