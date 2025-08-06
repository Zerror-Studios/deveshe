import { htmlParser } from "@/utils/Util";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
gsap.registerPlugin(ScrollTrigger);

const Section2 = ({ data }) => {
  const bannerRef = useRef(null);
  const overlayRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!bannerRef.current || !overlayRef.current || !textRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bannerRef.current,
          start: "top -40%",
          end: "top -100%",
          scrub: true,
          // markers: true,
        },
      });

      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 }
      );
      tl.to(textRef.current, { opacity: 1, duration: 1 });
      tl.to(textRef.current, { bottom: 0, duration: 2 });

      // Refresh to fix any layout shift issues
      setTimeout(() => ScrollTrigger.refresh(), 100);
    });

    return () => ctx.revert(); // kill timeline + scrolltriggers
  }, []);

  return (
    <div ref={bannerRef} id="lb-banner2">
      <div id="main-banner-container">
        <Image
          width={1000}
          height={1000}
          src={data?.imageUrl || ""}
          alt="image"
        />
        {data?.paragraph && (
          <div ref={textRef} id="main-banner-text">
            <p>{htmlParser(data?.paragraph || "")}</p>
          </div>
        )}
        <div ref={overlayRef} id="overlay-lb2"></div>
      </div>
    </div>
  );
};

export default Section2;
