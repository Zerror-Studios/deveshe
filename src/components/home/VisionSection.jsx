import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import React, { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);
const VisionSection = () => {
  useEffect(() => {
    // Split text into <span> only once
    function splitText(selector) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.dataset.split) {
          const letters = el.textContent
            .split("")
            .map((char) =>
              char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
            );
          el.innerHTML = letters.join("");
          el.dataset.split = "true";
        }
      });
    }

    splitText(".vision_text h2");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#vision_section",
          start: "top 85%",
          end: "top 55%",
          // scrub: true,
          // markers: true,
        },
      });

      tl.fromTo(
        ".vision_text h2 span",
        { rotateX: "90deg" },
        {
          duration: 0.8,
          rotateX: "0deg",
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      // Refresh in case layout/images/fonts shift anything
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div id="vision_section">
      <div className="vision_text">
        <h2 className="red">The vision</h2>
        <h2>behind the brand</h2>
      </div>
      <div className="vision_text2">
        <h6>Built on artistic instinct and expression</h6>
        <p>
          Born from a love for daydreaming and storytelling through clothes,
          DeVeSheDreams turns imagination into
          <strong> limited-edition pieces made with purpose</strong> and
          personality.
        </p>
      </div>
    </div>
  );
};

export default VisionSection;
