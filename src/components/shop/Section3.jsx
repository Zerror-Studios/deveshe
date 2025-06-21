import React from "react";
import styles from "./shop.module.css";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Section3 = () => {
  useGSAP(() => {
    document.querySelectorAll("#title-main-wrap h2").forEach((h) => {
      let clutter = "";
      h.textContent.split("").forEach((letter) => {
        if (letter === " ") {
          clutter += `<span>&nbsp;</span>`; // preserve space
        } else {
          clutter += `<span>${letter}</span>`;
        }
      });
      h.innerHTML = clutter;
    });

    const tl = gsap.timeline();
    tl.fromTo(
      "#title-main-wrap h2 span",
      {
        transform: "rotateX(90deg)",
      },
      {
        duration: 0.8,
        transform: "rotateX(0deg)",
        stagger: 0.05,
        // ease: "power2.out",
        ease: "bounce.out",
        delay: 0.8,
      }
    );
    gsap.set("#imgCardSec31", {
      y: -600,
      scale: 0.8,
      opacity: 0,
    });
    gsap.set("#imgCardSec32", {
      y: -700,
      scale: 0,
      opacity: 0,
    });
    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: "#imageContainer2",
        scroller: "body",
        start: "top 100%",
        end: "top 50%",
        // scrub: true,
        // markers: true,
      },
    });

    tl2.to("#imgCardSec31", {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "power2.out",
    });
    tl2.to("#imgCardSec32", {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1,
      delay: -0.4,
      ease: "power2.out",
    });
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);
  }, []);
  return (
    <div className={styles.shopSection3}>
      <Image
        width={1000}
        height={1000}
        src="/shop/shop-banner.jpg"
        alt="image"
      />
      <div className={styles.overlay3}>
        <div id="title-main-wrap">
          <h2>Discover New</h2>
          <h2>Collection!</h2>
        </div>
        <div className={styles.Section33Btm}>
          <p>
            Fashion that feels like you <br />
            expressive, bold, and one of a kind.
          </p>

          <h3>
            Dreamy prints, bold collabs
            <br />
            each piece is a feeling,
            <br />
            stitched into fabric.
          </h3>

          <h2 className={styles.titleh2}>you will get:</h2>
          <div className={styles.imageContainer2} id="imageContainer2">
            <div className={styles.imgCardSec3} id="imgCardSec31">
              <Image
                width={1000}
                height={1000}
                src="/newproduct/BI06.jpg"
                alt="image"
              />
              <p>
                Limited-edition drops with <span>soul</span>. Made in collab,
                made to stand out.
              </p>
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
            <Image
              width={1000}
              height={1000}
              src="https://emmpo.com/assets/0a541af8d51a8cd9d385.png"
              alt="image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section3;
