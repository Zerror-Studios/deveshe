import { htmlParser } from "@/utils/Util";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React from "react";

gsap.registerPlugin(ScrollTrigger);

// Text splitter utility
const splitText = (selector) => {
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
};

const LookBookHero = ({ title, subheading, description, asset }) => {
  useGSAP(() => {
    splitText(".lb-header-text h2");

    // Set initial states
    gsap.set(".lb-header-image", { y: "-55vh" });
    gsap.set(".lb-header-text h2 span", { rotateX: "90deg" });
    gsap.set(".lb-header-text p", { opacity: 0 });

    // Entry animation timeline
    const texttl = gsap.timeline();
    texttl
      .to(".lb-header-image", {
        y: 0,
        duration: 1,
        delay: 1,
        ease: "power4.out",
      })
      .to(".lb-header-text h2 span", {
        rotateX: "0deg",
        duration: 0.8,
        stagger: 0.05,
        ease: "bounce.out",
      })
      .to(".lb-header-text p", {
        opacity: 1,
        duration: 0.6,
        ease: "power1.out",
      });

    // Scroll animation timeline
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#lookbook-Sec1",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      })
      .to("#lookbook-Sec1 .lb-header-image img", {
        scale: 1.2,
        duration: 1,
        ease: "none",
      });
  }, []);

  return (
    <>
      <div id="lookbook-Sec1">
        <div className="lb-header-wrapper">
          <div className="lb-header">
            <div className="lb-header-text">
              <h2>{title || ""}</h2>
              <p>{subheading || ""}</p>
            </div>
          </div>
        </div>
        <div className="lb-header-image">
          <Image
            width={1000}
            height={1000}
            src={asset?.path || ""}
            alt={asset?.altText || ""}
          />
        </div>
      </div>
      {description && (
        <div id="lb-text-container">{htmlParser(description)}</div>
      )}
    </>
  );
};

export default LookBookHero;
