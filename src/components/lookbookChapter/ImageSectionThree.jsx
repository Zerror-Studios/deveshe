import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);
const ImageSectionThree = ({ leftData, rightData }) => {
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
      {leftData && (
        <div className="lb-section5-ig-wrap parallex">
          <Image
            width={1000}
            height={1000}
            src={leftData?.imageUrl || ""}
            alt=""
          />
        </div>
      )}
      {rightData && (
        <div className="lb-section5-ig-wrap scroll-section">
          <Image
            width={1000}
            height={1000}
            src={rightData?.imageUrl || ""}
            alt=""
          />
        </div>
      )}
    </div>
  );
};

export default ImageSectionThree;
