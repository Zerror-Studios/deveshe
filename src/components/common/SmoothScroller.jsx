import React, { useEffect, useLayoutEffect, useRef } from "react";
import Tempus from "@studio-freight/tempus";
import Lenis from "@studio-freight/lenis";
import { usePathname, useSearchParams } from "next/navigation";

export default function SmoothScroller() {
  const lenis = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true });
  }, [pathname, searchParams]);

  useLayoutEffect(() => {
    lenis.current = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: true,
      direction: "vertical",
      gestureDirection: "vertical",
      wheelMultiplier: 0.8,
      touchMultiplier: 1.2,
      infinite: false,
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

    function onFrame(time) {
      if (lenis.current) lenis.current.raf(time);
    }

    const unsubscribe = Tempus.add(onFrame);

    return () => {
      unsubscribe();
      resizeObserver?.disconnect();
      window.removeEventListener("load", scheduleResize);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      if (lenis.current) {
        lenis.current.destroy();
        lenis.current = null;
      }
    };
  }, []);

  return null;
}
