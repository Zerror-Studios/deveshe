import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);
const Section5 = () => {

useEffect(() => {
  if (window.innerWidth < 576) return;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#lb-section5",
        start: "top 90%",
        end: "bottom -50%",
        scrub: true,
        // markers: true,
      },
    });

    tl.to(".scroll-section", {
      y: 270,
      ease: "none",
    });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: "#lb-section5",
        start: "top bottom",
        end: "bottom 80%",
        scrub: true,
        // markers: true,
      },
    });

    tl2.to(".parallex img", {
      y: 50,
      ease: "none",
    });

     setTimeout(() => ScrollTrigger.refresh(), 100); 
  });

  return () => ctx.revert(); // cleanup animations + triggers
}, []);

  return (
    <div id="lb-section5">
      <div className="lb-section5-ig-wrap parallex">
        <Image
          width={1000}
          height={1000}
          src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2F6231f4265c%2Fcod-tv-1_1-colcor.jpg&w=1920&q=90"
          alt=""
        />
      </div>
      <div className="lb-section5-ig-wrap scroll-section">
        <Image
          width={1000}
          height={1000}
          src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2Fa994b45c80%2Fcod-apple-3_1-colcor.jpg&w=1920&q=90"
          alt=""
        />
      </div>
    </div>
  );
};

export default Section5;
