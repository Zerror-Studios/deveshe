import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import Image from 'next/image';
import React, { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

const ImageSectionOne = () => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#lb-section3",
          start: "top bottom",     // element top hits bottom of viewport
          end: "bottom top",          // element top reaches top of viewport
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
          src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1786x2500%2F0e206cacea%2Fcod-socks-2_1-colcorr.jpg&w=1080&q=90"
          alt="image"
        />
      </div>
    </div>
  );
};

export default ImageSectionOne;
