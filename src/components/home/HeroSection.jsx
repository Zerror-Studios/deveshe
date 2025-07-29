import React, { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styles from "@/components/home/Home.module.css";
gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
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

    splitText("#title-main-wrap h2");

    const ctx = gsap.context(() => {
      // Text animation
      const textTimeline = gsap.timeline();
      textTimeline.fromTo(
        "#title-main-wrap h2 span",
        { rotateX: "90deg" },
        {
          rotateX: "0deg",
          duration: 0.8,
          stagger: 0.05,
          ease: "bounce.out",
          delay: 9,
        }
      );

      // Initial image styles
      gsap.set("#imgCardSec31", { y: -600, scale: 0.8, opacity: 0 });
      gsap.set("#imgCardSec32", { y: -700, scale: 0, opacity: 0 });

      // Image animation
      const imageTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#imageContainer2",
          start: "top 100%",
          end: "top 50%",
          // scrub: true,
          // markers: true,
        },
      });

      imageTimeline.to("#imgCardSec31", {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      });

      imageTimeline.to("#imgCardSec32", {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        delay: -0.4,
        ease: "power2.out",
      });

      // Refresh ScrollTrigger to fix any layout issues
      setTimeout(() => ScrollTrigger.refresh(), 50);
    });

    return () => ctx.revert(); // clean up on unmount
  }, []);

  return (
    <div className={styles.shopSection3} id="home_banner">
      <Image
        width={1000}
        height={1000}
        src="/home/home_banner.webp"
        alt="image"
      />
      <div className={styles.overlay3}>
        <div id="title-main-wrap">
          <h2>Check our</h2>
          <h2>new collection</h2>
        </div>
        <div className={styles.Section33Btm}>
          <div className={styles.Section33Btmleft}>
            <p>
              Fashion that feels like you. <br />
              Dopamine dressing for everday.
            </p>

            <h3>
              Dreamy prints, bold collabs
              <br />
              each piece is a feeling,
              <br />
              stitched into fabric.
            </h3>
          </div>

          <div className={styles.Section33Btmright}>
            <div className={styles.imageContainer2} id="imageContainer2">
              <div className={styles.imgCardSec3} id="imgCardSec31">
                <Image
                  width={1000}
                  height={1000}
                  src="/newproduct/BI06.jpg"
                  alt="image"
                />
                <p>From office to <span>OOO</span></p>
              </div>
              <div className={styles.imgCardSec3} id="imgCardSec32">
                <Image
                  width={1000}
                  height={1000}
                  src="/newproduct/BI04.jpg"
                  alt="image"
                />
                <p>
                  Bold pieces you won’t find <span>twice</span>. Crafted for
                  dreamers, worn by you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
