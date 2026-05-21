"use client";

import { TransitionRouter } from "next-transition-router";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import "@/styles/components/page-transition.css";

gsap.registerPlugin(DrawSVGPlugin);

const SVG_PATH =
  "M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213";

// page-transition.jsx
export default function TransitionWrapper({ children }) {
  const transitionOverlayRef = useRef(null);
  const svgPathRef = useRef(null);
  const logoRef = useRef(null);         // ← add this ref

  useEffect(() => {
    if (svgPathRef.current) {
      gsap.set(svgPathRef.current, { drawSVG: "0%", strokeWidth: 2 });
    }
    if (logoRef.current) {
      gsap.set(logoRef.current, { opacity: 0, scale: 0.85 }); // ← initial state
    }
  }, []);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        const overlay = transitionOverlayRef.current;
        const tl = gsap.timeline({
          onStart: () => overlay?.classList.add("is-active"),
          onComplete: next,
        });

        tl.to(overlay, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut",
        })
          .to(
            svgPathRef.current,
            { drawSVG: "100%", strokeWidth: 300, duration: 1.5, ease: "power2.inOut" },
            0
          )
          .to(
            logoRef.current,
            { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
            ">"
          );

        return () => {
          tl.kill();
          overlay?.classList.remove("is-active");
        };
      }}
      enter={(next) => {
        const overlay = transitionOverlayRef.current;
        const tl = gsap.timeline({
          onComplete: () => {
            overlay?.classList.remove("is-active");
            next();
          },
        });

        tl.to(logoRef.current, {        // ← fade logo out first
          opacity: 0,
          scale: 0.85,
          duration: 0.3,
          ease: "power2.in",
        })
          .to(
            svgPathRef.current,
            { drawSVG: "100% 100%", strokeWidth: 2, duration: 1.5, ease: "power2.inOut" },
            0
          )
          .to(
            overlay,
            { opacity: 0, duration: 0.5, ease: "power2.inOut" },
            1
          )
          .set(svgPathRef.current, { drawSVG: "0%", strokeWidth: 2 });

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

        {/* ← Logo centered over the SVG */}
        <img
          ref={logoRef}
          src="/assets/images/logo/logo-m.webp"
          alt="Logo"
          className="page-transition-overlay__logo"
        />
      </div>
      {children}
    </TransitionRouter>
  );
}