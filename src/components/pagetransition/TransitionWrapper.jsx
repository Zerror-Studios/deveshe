"use client";

import { TransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import "@/styles/components/page-transition.css";

gsap.registerPlugin(DrawSVGPlugin);

const SVG_PATH =
  "M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213";

const HOMEPAGE_LOGO_KEY = "dd-homepage-logo-intro";

const TIMING = {
  short: {
    overlay: 0.5,
    brush: 1.5,
  },
  logo: {
    overlay: 0.5,
    brush: 1.5,
    logoIn: 0.35,
    logoOut: 0.25,
    hold: 0.15,
  },
};

function normalizePath(href) {
  if (!href) return "";
  try {
    const url = href.startsWith("http")
      ? new URL(href)
      : new URL(href, window.location.origin);
    return url.pathname;
  } catch {
    return href.split("?")[0] || "";
  }
}

function isHomepage(path) {
  return normalizePath(path) === "/";
}

function isCheckoutPath(path) {
  return normalizePath(path).startsWith("/checkout");
}

function hasSeenHomepageLogo() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(HOMEPAGE_LOGO_KEY) === "1";
  } catch {
    return true;
  }
}

function markHomepageLogoSeen() {
  try {
    localStorage.setItem(HOMEPAGE_LOGO_KEY, "1");
  } catch {
    /* ignore */
  }
}

function shouldShowHomepageLogo(path) {
  return isHomepage(path) && !hasSeenHomepageLogo();
}

export default function TransitionWrapper({ children }) {
  const pathname = usePathname();
  const transitionOverlayRef = useRef(null);
  const svgPathRef = useRef(null);
  const logoRef = useRef(null);
  const initialIntroStarted = useRef(false);

  useEffect(() => {
    if (svgPathRef.current) {
      gsap.set(svgPathRef.current, { drawSVG: "0%", strokeWidth: 2 });
    }
    if (logoRef.current) {
      gsap.set(logoRef.current, { opacity: 0, scale: 0.85 });
    }
  }, []);

  const runBrushCover = (tl, overlay, path, { duration }) => {
    tl.to(overlay, {
      opacity: 1,
      duration: TIMING.short.overlay,
      ease: "power2.inOut",
    }).to(
      path,
      {
        drawSVG: "100%",
        strokeWidth: 300,
        duration,
        ease: "power2.inOut",
      },
      0
    );
  };

  const runBrushReveal = (tl, overlay, path, logo, { showLogo, onComplete }) => {
    const brushDuration = showLogo ? TIMING.logo.brush : TIMING.short.brush;
    const overlayFade = showLogo ? TIMING.logo.overlay : TIMING.short.overlay;

    if (showLogo && logo) {
      tl.to(logo, {
        opacity: 1,
        scale: 1,
        duration: TIMING.logo.logoIn,
        ease: "back.out(1.7)",
      })
        .to({}, { duration: TIMING.logo.hold })
        .to(logo, {
          opacity: 0,
          scale: 0.85,
          duration: TIMING.logo.logoOut,
          ease: "power2.in",
        });
    } else if (logo) {
      gsap.set(logo, { opacity: 0, scale: 0.85 });
    }

    tl.to(path, {
      drawSVG: "100% 100%",
      strokeWidth: 2,
      duration: brushDuration,
      ease: "power2.inOut",
    }).to(
      overlay,
      {
        opacity: 0,
        duration: overlayFade,
        ease: "power2.inOut",
      },
      `-=${overlayFade}`
    )
      .set(path, { drawSVG: "0%", strokeWidth: 2 })
      .call(() => {
        if (showLogo) markHomepageLogoSeen();
        onComplete?.();
      });
  };

  /* First visit landing on homepage — logo + brush intro */
  useEffect(() => {
    if (initialIntroStarted.current) return;
    if (pathname !== "/") return;
    if (hasSeenHomepageLogo()) return;

    initialIntroStarted.current = true;

    const overlay = transitionOverlayRef.current;
    const path = svgPathRef.current;
    const logo = logoRef.current;
    if (!overlay || !path) return;

    overlay.classList.add("is-active");
    gsap.set(overlay, { opacity: 1 });
    gsap.set(path, { drawSVG: "0%", strokeWidth: 2 });
    if (logo) gsap.set(logo, { opacity: 0, scale: 0.85 });

    const tl = gsap.timeline({
      onComplete: () => overlay.classList.remove("is-active"),
    });

    runBrushCover(tl, overlay, path, { duration: TIMING.logo.brush });
    runBrushReveal(tl, overlay, path, logo, { showLogo: true });
  }, [pathname]);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        if (isCheckoutPath(pathname)) {
          next();
          return () => {};
        }

        const overlay = transitionOverlayRef.current;
        const path = svgPathRef.current;
        const logo = logoRef.current;

        if (logo) gsap.set(logo, { opacity: 0, scale: 0.85 });

        const tl = gsap.timeline({
          onStart: () => overlay?.classList.add("is-active"),
          onComplete: next,
        });

        runBrushCover(tl, overlay, path, { duration: TIMING.short.brush });

        return () => {
          tl.kill();
          overlay?.classList.remove("is-active");
        };
      }}
      enter={(next) => {
        if (isCheckoutPath(pathname)) {
          next();
          return () => {};
        }

        const overlay = transitionOverlayRef.current;
        const path = svgPathRef.current;
        const logo = logoRef.current;
        const showLogo = shouldShowHomepageLogo(pathname);

        const tl = gsap.timeline({
          onComplete: () => {
            overlay?.classList.remove("is-active");
            next();
          },
        });

        runBrushReveal(tl, overlay, path, logo, { showLogo });

        return () => {
          tl.kill();
          overlay?.classList.remove("is-active");
        };
      }}
    >
      <div
        ref={transitionOverlayRef}
        className="page-transition-overlay"
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1316 664"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="page-transition-overlay__svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            ref={svgPathRef}
            d={SVG_PATH}
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <img
          ref={logoRef}
          src="/assets/images/logo/logo-m.webp"
          alt=""
          className="page-transition-overlay__logo"
        />
      </div>
      {children}
    </TransitionRouter>
  );
}
