import React, { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styles from "@/components/home/Home.module.css";
gsap.registerPlugin(ScrollTrigger);

const ExploreSection = () => {
  useEffect(() => {
    // Text splitter utility
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

    // Split headings
    splitText("#title-main-wrap3 h2");
    splitText("#btn-text-wrap h4");

    const ctx = gsap.context(() => {
      // Scroll-based text animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#section2-shop",
          start: "top 60%",
          end: "top 20%",
          // scrub: true,
          // markers: true,
        },
      });

      tl.fromTo(
        "#title-main-wrap3 h2 span",
        { rotateX: "90deg" },
        {
          rotateX: "0deg",
          duration: 0.8,
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      // Button hover animation
      const btnEl = document.querySelector("#btn-text-wrap");
      const enterHandler = () => {
        gsap.fromTo(
          ".text1-btn span",
          { y: "0%" },
          {
            y: "-100%",
            duration: 0.5,
            stagger: { amount: 0.2 },
          }
        );
        gsap.fromTo(
          ".text2-btn span",
          { y: "0%" },
          {
            y: "-100%",
            duration: 0.5,
            stagger: { amount: 0.2 },
          }
        );
      };

      if (btnEl) btnEl.addEventListener("mouseenter", enterHandler);

      // Strip animation
      const isMobile = window.innerWidth < 576;

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: "#section2-bottom-shop",
          start: "top 70%",
          end: "top 20%",
          // scrub: true,
          // markers: true,
        },
      });

      const strip1Y = isMobile ? -100 : -200;
      const strip2Y = isMobile ? -100 : -200;

      tl2.fromTo(
        "#strip1-shop",
        {
          y: strip1Y,
          x: -300,
          rotation: -25,
          scale: 0.8,
        },
        {
          y: 0,
          x: 0,
          rotation: -25,
          scale: 1,
          duration: 1.5,
          ease: "power2.out",
        },
        "a"
      );

      tl2.fromTo(
        "#strip2-shop",
        {
          y: strip2Y,
          x: 300,
          rotation: 25,
          scale: 0.8,
        },
        {
          y: 0,
          x: 0,
          rotation: 25,
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
        },
        "a"
      );

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      // Clean up: animations + event listener
      return () => {
        ctx.revert();
        if (btnEl) btnEl.removeEventListener("mouseenter", enterHandler);
      };
    });
  }, []);

  const strip1Images = [
    "/shop/side1.jpg",
    "/shop/side2.jpg",
    "/shop/side3.jpg",
    "/shop/side4.jpg",
  ];

  const strip2Images = [
    "/shop/side5.jpg",
    "/shop/side7.jpg",
    "/shop/side6.jpg",
    "/shop/shop1.jpg",
  ];

  return (
    <div className={styles.shopSection2} id="section2-shop">
      <div className={styles.shopSection2Top}>
        <div id="title-main-wrap3">
          <h2 className={styles.explore}>Explore</h2>
          <h2>styles that</h2>
          <h2>feel like</h2>
          <h2>you.</h2>
        </div>
        <div className={styles.shopSection2TopBtm}>
          <div className={styles.leftCard}>
            <Image
              width={1000}
              height={1000}
              src="/shop/shop2.jpg"
              alt="image"
            />
          </div>
          <div className={styles.centerCard}>
            <div className={styles.imgCont}>
              <Image
                width={1000}
                height={1000}
                src="/shop/shop1.jpg"
                alt="image"
              />
            </div>
            <p>
              Find pieces that reflect who you are — easy to wear, made to love.
            </p>
          </div>
          <div className={styles.rightCard}>
            <Image
              width={1000}
              height={1000}
              src="/shop/shop3.jpg"
              alt="image"
            />
          </div>
        </div>
      </div>
      <div className={styles.shopSection2Bottom} id="section2-bottom-shop">
        <h5 className={styles.inspo}>All inspired by</h5>
        <h3>
          Creativity, <br />
          Collaboration, <br />
          and Craft.
        </h3>
        <div className={styles.shopSection2BottomBtn}>
          [
          <div className={styles.shopSection2BottomBtnText} id="btn-text-wrap">
            <h4>Shop Now</h4>
            <h4 className="text1-btn">Shop Now</h4>
            <h4 className="text2-btn">Shop Now</h4>
          </div>
          ]
        </div>
        <div className={styles.strip1} id="strip1-shop">
          {strip1Images.map((src, index) => (
            <Image
              key={`strip1-${index}`}
              width={1000}
              height={1000}
              src={src}
              alt={`shop image ${index + 1}`}
            />
          ))}
        </div>
        <div className={styles.strip2} id="strip2-shop">
          {strip2Images.map((src, index) => (
            <Image
              key={`strip2-${index}`}
              width={1000}
              height={1000}
              src={src}
              alt={`shop image ${index + 5}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;
