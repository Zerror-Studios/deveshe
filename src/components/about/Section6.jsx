import React, { useEffect } from "react";
import styles from "../shop/shop.module.css";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Section6 = () => {
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
          el.dataset.split = "true";
        }
      });
    }

    splitText("#title-main-wrap6 h2");

    const ctx = gsap.context(() => {
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: "#title-main-wrap6",
          start: "top 80%",
          end: "top 50%",
          // scrub: true,
          // markers: true,
        },
      });

      tl2.fromTo(
        "#title-main-wrap6 span",
        { rotateX: "90deg" },
        {
          duration: 0.8,
          rotateX: "0deg",
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      // Refresh ScrollTrigger to ensure accuracy
      setTimeout(() => ScrollTrigger.refresh(), 50);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.shopSection6}>
      <div id="title-main-wrap6">
        <h2>It's great to see you</h2>
        <h2>
          on <span>your journey</span> to
        </h2>
        <h2>discovering your</h2>
        <h2>style</h2>
      </div>
    </div>
  );
};

export default Section6;
