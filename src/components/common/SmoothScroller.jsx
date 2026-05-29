import React, { useEffect, useLayoutEffect, useRef } from "react";
import Tempus from "@studio-freight/tempus";
import Lenis from "@studio-freight/lenis";
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

    const resize = setInterval(() => {
      if (lenis.current) lenis.current.resize();
    }, 150);

    function onFrame(time) {
      if (lenis.current) lenis.current.raf(time);
    }

    const unsubscribe = Tempus.add(onFrame);

    return () => {
      unsubscribe();
      clearInterval(resize);
      if (lenis.current) {
        lenis.current.destroy();
        lenis.current = null;
      }
    };
  }, [disableSmoothScroll]);

  return null;
}
