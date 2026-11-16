/**
 * A `next/image` hero with an optional phone image (backend PRD-045 FR-7)
 *
 * Without a mobile image it is a plain `next/image` (`fill`). With one it
 * is a `<picture>`: the mobile file up to the 768 px breakpoint, the
 * desktop one otherwise, both through Next's optimizer (`getImageProps`),
 * so the browser downloads only the one it shows. The hero is usually the
 * page's LCP, so `priority` loads it eagerly with `fetchPriority="high"`
 * (page speed rules, CLAUDE.md §3).
 */

import Image, { getImageProps } from "next/image";
import { toHeroPositionStyle } from "@/components/common/ResponsivePicture";
import { MOBILE_IMAGE_MEDIA } from "@/utils/responsive-image.util";

// ─── Component ────────────────────────────────────────────────────────────

export default function ResponsiveHeroImage({
  desktop,
  mobile = null,
  alt = "",
  className = "",
  sizes = "100vw",
  priority = false,
}) {
  if (!desktop?.src) return null;

  const imageClassName = `${className} responsive_hero_img`.trim();
  const positionStyle = toHeroPositionStyle(desktop, mobile);

  if (!mobile?.src) {
    return (
      <Image
        key={desktop.src}
        src={desktop.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        className={imageClassName}
        style={positionStyle}
      />
    );
  }

  const common = { alt, fill: true, sizes };
  const {
    props: { srcSet: mobileSrcSet, sizes: mobileSizes },
  } = getImageProps({ ...common, src: mobile.src });
  const {
    props: { style, ...imageProps },
  } = getImageProps({
    ...common,
    src: desktop.src,
    loading: priority ? "eager" : undefined,
    fetchPriority: priority ? "high" : undefined,
  });

  return (
    <picture key={`${desktop.src}|${mobile.src}`}>
      <source
        media={MOBILE_IMAGE_MEDIA}
        srcSet={mobileSrcSet}
        sizes={mobileSizes}
      />
      <img
        {...imageProps}
        alt={alt}
        className={imageClassName}
        style={{ ...style, ...positionStyle }}
      />
    </picture>
  );
}
