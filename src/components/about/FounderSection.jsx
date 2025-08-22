import React, { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const FounderSection = () => {
  useEffect(() => {
    function splitText(selector) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.dataset.split) {
          const letters = el.textContent
            .split("")
            .map((char) =>
              char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
            );
          el.innerHTML = letters.join("");
          el.dataset.split = "true"; // prevent re-splitting
        }
      });
    }

    splitText("#founder_title h2");
    const ctx = gsap.context(() => {
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: "#founder_title",
          start: "top 70%",
          end: "top 50%",
        },
      });

      tl1.fromTo(
        "#founder_title h2 span",
        { rotateX: "90deg" },
        {
          duration: 0.8,
          rotateX: "0deg",
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      setTimeout(() => ScrollTrigger.refresh(), 50);
    });

    return () => ctx.revert(); // clean up on unmount
  }, []);

  return (
    <div id="founder_section">
      <Image
        width={1000}
        height={1000}
        src="/assets/images/about/banner-img.webp"
        alt="founder_image"
      />
      <div className="founder_overlay">
        <div id="founder_title">
          <h2>The person</h2>
          <h2>behind the brand</h2>
        </div>
        <div className="social_card_container">
          <div className="social_card">
            <Image
              width={1000}
              height={1000}
              alt="gif"
              src="/assets/images/about/social_gif.gif"
            />
            <a
              href="https://www.instagram.com/de_ve_she_dreams"
              target="_blank"
            >
              follow my instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderSection;
