import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SplitText from "gsap/dist/SplitText";
import PolaroidCard from "../common/card/PolaroidCard";

gsap.registerPlugin(ScrollTrigger, SplitText);

const HeroSection = () => {
  const polaroidRef = useRef(null);
  const sectionRef = useRef(null);
  const splitInstances = useRef([]);
  const triggers = useRef([]);

  useEffect(() => {
    const runSplitAnimation = () => {
      const lines = sectionRef.current?.querySelectorAll("h3, p") || [];

      lines.forEach((el) => {
        const split = new SplitText(el, {
          type: "lines",
          mask: "lines", // creates overflow hidden mask divs
          linesClass: "line",
        });

        splitInstances.current.push(split);

        // Initial state: hidden below
        gsap.set(split.lines, { yPercent: 100, opacity: 0 });

        // Reveal animation with stagger
        const trigger = gsap.to(split.lines, {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          delay: 2,
          ease: "power3.out",
          stagger: 0.1,
        });

        triggers.current.push(trigger.scrollTrigger);
      });

      ScrollTrigger.refresh();
    };

    const fontReady = document.fonts?.ready || Promise.resolve();

    fontReady.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          runSplitAnimation();
        });
      });
    });

    return () => {
      triggers.current.forEach((st) => st?.kill());
      splitInstances.current.forEach((split) => split.revert());
      ScrollTrigger.refresh();
    };
  }, []);

  useEffect(() => {
    let refreshTimeout;

    if (!polaroidRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: polaroidRef.current,
          start: "top 40%",
          end: "bottom bottom",
        },
      });

      tl.to(".polaroid_card", {
        x: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        stagger: 0.3,
      });
    }, polaroidRef);

    const handleLoad = () => {
      refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimeout);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <div id="home_hero">
      <Image
        width={1000}
        height={1000}
        src="/assets/images/home/home_banner.webp"
        alt="home_banner"
      />
      <div id="hero_container">
        <div ref={sectionRef} className="text_container">
          <div className="text_container_wrap">
            <p>Fashion that feels like you. Dopamine dressing for everday.</p>
            <h3>
              Dreamy prints, bold collabs each piece is a feeling, stitched into
              fabric.
            </h3>
          </div>
        </div>
        <div className="polaroid_container" ref={polaroidRef}>
          <PolaroidCard
            image={"/assets/images/home/polaroid1.webp"}
            content={
              <p>
                From office to <span>OOO</span>
              </p>
            }
          />
          <PolaroidCard
            image={"/assets/images/home/polaroid2.webp"}
            content={
              <p>
                Bold pieces you won’t find <span>twice.</span> Crafted for
                dreamers, worn by you.
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
