import React, { useEffect } from "react";
import styles from "./shop.module.css";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Section4 = () => {
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

    splitText("#title-main-wrap2 h2");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#section4-shop",
          start: "top 85%",
          end: "top 55%",
          // scrub: true,
          // markers: true,
        },
      });

      tl.fromTo(
        "#title-main-wrap2 h2 span",
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
    <div className={styles.shopSection4} id="section4-shop">
      <div className={styles.topCont}>
        <div className={styles.topContHeader} id="title-main-wrap2">
          <h2>
            The <span>vision</span>
          </h2>
          <h2>behind the brand</h2>
        </div>
        <div className={styles.bottomContPara}>
          <h6>Built on artistic instinct and expression</h6>
          <p>
            Born from a love for daydreaming and storytelling through clothes,
            DeVeSheDreams turns imagination into{" "}
            <span>limited-edition pieces made with purpose</span> and
            personality.
          </p>
        </div>
      </div>
      <div className={styles.bottomCont}>
        <Image
          width={1000}
          height={1000}
          src="https://emmpo.com/assets/ce3c8196da068a1ba841.png"
          alt="image"
        />
      </div>
    </div>
  );
};

export default Section4;
