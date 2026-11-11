"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname, useSearchParams } from "next/navigation";

function isCheckoutRoute(pathname) {
  return pathname?.startsWith("/checkout") ?? false;
}

export default function SmoothScroller() {
  const lenis = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const disableSmoothScroll = isCheckoutRoute(pathname);

  useEffect(() => {
    if (disableSmoothScroll) {
      window.scrollTo(0, 0);
      return;
    }
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true });
  }, [pathname, searchParams, disableSmoothScroll]);

  useLayoutEffect(() => {
    if (disableSmoothScroll) {
      if (lenis.current) {
        lenis.current.destroy();
        lenis.current = null;
      }
      document.documentElement.style.removeProperty("overflow");
      return;
    }

    // The options @studio-freight/lenis 1.0.42 actually applied (it ignored
    // `smooth`, `smoothTouch`, `direction` and `gestureDirection`): smooth
    // wheel, native touch, vertical. `autoRaf` replaces the Tempus loop.
    lenis.current = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      orientation: "vertical",
      gestureOrientation: "vertical",
      wheelMultiplier: 0.8,
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: true,
    });

    // Re-measure only when the page content changes size (SF-17); Lenis
    // already handles window resizes.
    let resizeFrame = null;
    const scheduleResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        if (lenis.current) lenis.current.resize();
      });
    };
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleResize)
        : null;
    resizeObserver?.observe(document.body);
    window.addEventListener("load", scheduleResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("load", scheduleResize);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      if (lenis.current) {
        lenis.current.destroy();
        lenis.current = null;
      }
    };
  }, [disableSmoothScroll]);

  return null;
}
