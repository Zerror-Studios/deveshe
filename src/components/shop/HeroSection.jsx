
"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

const HeroSection = () => {
  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!sectionRef.current || !innerRef.current || !imgRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(innerRef.current, { yPercent: 0, force3D: true });
      gsap.set(imgRef.current, {
        yPercent: 0,
        scale: 1,
        transformOrigin: "50% 0%",
        force3D: true,
      });

      gsap.to(innerRef.current, {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(imgRef.current, {
        yPercent: 100,
        scale: 1.5,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="shop_hero_section">
      <div className="shop_hero_section_content">
        <p>
          Discover our latest collection of outerwear. Carefully crafted from
          the finest fabrics and premium hardware.
        </p>
      </div>
      <div ref={innerRef} className="shop_hero_section_inner">
        <Image
          src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2250x1266%2Ffe9b1c412b%2Fjacket-ban-2.jpg&w=1920&q=90"
          alt="hero_section"
          width={1000}
          height={1000}
          ref={imgRef}
        />
      </div>
    </div>
  );
};

export default HeroSection