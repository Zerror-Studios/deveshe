import React, { useEffect } from "react";
import styles from "../shop/shop.module.css";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const Section5 = () => {

useEffect(() => {
  function splitText(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.dataset.split) {
        const letters = el.textContent.split("").map((char) =>
          char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
        );
        el.innerHTML = letters.join("");
        el.dataset.split = "true"; // prevent re-splitting
      }
    });
  }

  splitText("#title-main-wrap5 h2");
  splitText("#title-main-wrap51");

  const ctx = gsap.context(() => {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: "#title-main-wrap5",
        start: "top 70%",
        end: "top 50%",
        // scrub: true,
        // markers: true,
      },
    });

    tl1.fromTo(
      "#title-main-wrap5 h2 span",
      { rotateX: "90deg" },
      {
        duration: 0.8,
        rotateX: "0deg",
        stagger: 0.05,
        ease: "bounce.out",
      }
    );

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: "#title-main-wrap51",
        start: "top 70%",
        end: "top 50%",
        // scrub: true,
        // markers: true,
      },
    });

    tl2.fromTo(
      "#title-main-wrap51 span",
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
    <div className={styles.shopSection5}>
      <Image
        width={1000}
        height={1000}
        src="/newproduct/BI02.jpg"
        alt="ig5-banner"
      />
      <div className={styles.overlay5}>
        <div id="title-main-wrap5">
          <h2>The person</h2>
          <h2>behind the brand</h2>
        </div>
        <div className={styles.bigCardContainer}>
          <div className={styles.bigCard}>
            <video
              autoPlay
              muted
              loop
              playsInline
              src="https://emmpo.com/assets/395808beb2e10735b70b.mp4"
            ></video>
            <p>follow my instagram</p>
          </div>
        </div>
        <h2 id="title-main-wrap51">Hey there!</h2>
      </div>
    </div>
  );
};

export default Section5;
