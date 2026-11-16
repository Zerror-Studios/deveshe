/**
 * A plain `<img>` hero with an optional phone image (backend PRD-045 FR-7)
 *
 * For the heroes that animate their `<img>` directly (the shop and
 * lookbook heroes, GSAP): without a mobile image it is the same `<img>` as
 * before; with one it is wrapped in a `<picture>` (`display: contents`, so
 * the layout doesn't change) whose source shows the mobile file up to the
 * 768 px breakpoint. The browser downloads only the one it shows.
 *
 * Each image's focal point and crop are CSS variables
 * (`toHeroImageStyle`) that `.responsive_hero_img` turns into
 * `object-position` / `object-view-box` per breakpoint (`globals.css`).
 */

import {
  MOBILE_IMAGE_MEDIA,
  toHeroImageStyle,
} from "@/utils/responsive-image.util";

// ─── Helpers ──────────────────────────────────────────────────────────────

/** The focal points and crops as the CSS variables `.responsive_hero_img` reads. */
export const toHeroPositionStyle = (desktop, mobile) =>
  toHeroImageStyle(desktop, mobile?.src ? mobile : null);

// ─── Component ────────────────────────────────────────────────────────────

export default function ResponsivePicture({
  src,
  mobileSrc = null,
  desktop = null,
  mobile = null,
  alt = "",
  className = "",
  imgRef,
  fetchPriority,
}) {
  const imageClassName = `${className} responsive_hero_img`.trim();
  const image = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={imageClassName}
      style={toHeroPositionStyle(desktop, mobile)}
      fetchPriority={fetchPriority}
    />
  );
  if (!mobileSrc) return image;
  return (
    <picture className="responsive_picture">
      <source media={MOBILE_IMAGE_MEDIA} srcSet={mobileSrc} />
      {image}
    </picture>
  );
}
