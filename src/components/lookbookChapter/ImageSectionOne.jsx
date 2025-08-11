import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const ImageSectionOne = ({ data }) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#lb-section3",
          start: "top bottom", // element top hits bottom of viewport
          end: "bottom top", // element top reaches top of viewport
          scrub: 1,
          markers: false,
        },
      });

      tl.to("#lb-section3-ig img", {
        y: 100,
        duration: 1,
        ease: "none",
      });

      setTimeout(() => ScrollTrigger.refresh(), 100); // handle layout shifts
    });

    return () => ctx.revert();
  }, []);

  return (
    <div id="lb-section3">
      <div id="lb-section3-ig">
        <Image
          width={1000}
          height={1000}
          src={data?.imageUrl || ""}
          alt="image"
        />
      </div>
    </div>
  );
};

export default ImageSectionOne;
