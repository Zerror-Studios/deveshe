import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Tempus from '@studio-freight/tempus';
import Lenis from '@studio-freight/lenis';
import { usePathname, useSearchParams } from 'next/navigation';

export default function SmoothScroller() {
  const lenis = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true });
  }, [pathname, searchParams]);

  useLayoutEffect(() => {
    lenis.current = new Lenis({
      smoothWheel: true,
      // Customize other instance settings here
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
  }, []);

  return null;
}
