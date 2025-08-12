import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import PolaroidCard from "../common/card/PolaroidCard/PolaroidCard";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const polaroidRef = useRef(null);

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
        <div className="text_container">
          <p>Fashion that feels like you. Dopamine dressing for everday.</p>
          <h3>
            Dreamy prints, bold collabs each piece is a feeling, stitched into
            fabric.
          </h3>
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
