import React from "react";
import styles from "./shop.module.css";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Section2 = () => {
  useGSAP(() => {
    function splitText(element) {
      document.querySelectorAll(element).forEach((h) => {
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
    }
    splitText("#title-main-wrap3 h2");
    splitText("#btn-text-wrap h4");

    //text animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section2-shop",
        scroller: "body",
         start: "top 60%",
        end: "top 20%",
        // scrub: true,
        // markers: true
      },
    });
    tl.fromTo(
      "#title-main-wrap3 h2 span",
      {
        transform: "rotateX(90deg)",
      },
      {
        duration: 0.8,
        transform: "rotateX(0deg)",
        stagger: 0.05,
        // ease: "power2.out",
        ease: "bounce.out",
      }
    );

    // btn hover animation
    document
      .querySelector("#btn-text-wrap")
      .addEventListener("mouseenter", (e) => {
        gsap.fromTo(
          ".text1-btn span",
          {
            y: "0%",
          },
          {
            duration: 0.5,
            y: "-100%",
            stagger: {
              amount: 0.2,
            },
            // ease: "power2.out",
          }
        );
        gsap.fromTo(
          ".text2-btn span",
          {
            y: "0%",
          },
          {
            duration: 0.5,
            y: "-100%",
            stagger: {
              amount: 0.2,
            },
            // ease: "power2.out",
          }
        );
      });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: "#section2-bottom-shop",
        scroller: "body",
        start: "top 70%",
        end: "top 20%",
        // scrub: true,
        // markers: true
      },
    });
    tl2.fromTo(
      "#strip1-shop",
      {
        y: -300,
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
        y: -300,
        x: 300,
        rotation: 25,
        scale: 0.8,
      },
      {
        y: 0,
        x: 0,
        opacity: 1,
        rotation: 25,
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
      },
      "a"
    );

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, []);

  return (
    <div className={styles.shopSection2} id="section2-shop">
      <div className={styles.shopSection2Top}>
        <div className={styles.crossImg}>
          <Image
            height={1000}
            width={1000}
            src="https://emmpo.com/assets/51deafe99e147c5239b2.png"
            alt="cross-img"
          />
        </div>
        <div id="title-main-wrap3">
          <h2>Explore</h2>
          <h2>styles that</h2>
          <h2>feel like</h2>
          <h2>you.</h2>
        </div>
        <div className={styles.shopSection2TopBtm}>
          <div className={styles.leftCard}>
            <Image
              width={1000}
              height={1000}
              src="/shop/Peach_crochet_shirt.webp"
              alt="image"
            />
          </div>
          <div className={styles.centerCard}>
            <div className={styles.imgCont}>
              <Image
                width={1000}
                height={1000}
                src="/shop/Silver metallic crochet bib.jpeg"
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
              src="/shop/Gold crochet bib.JPG"
              alt="image"
            />
          </div>
        </div>
      </div>
      <div className={styles.shopSection2Bottom} id="section2-bottom-shop">
        <h5>All inspired by</h5>
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
          <Image
            width={1000}
            height={1000}
            src="/shop/dress1.jpeg"
            alt="image"
          />
          <Image
            width={1000}
            height={1000}
            src="/shop/dress4.jpeg"
            alt="image"
          />
          <Image
            width={1000}
            height={1000}
            src="/shop/dress1.jpeg"
            alt="image"
          />
          <Image
            width={1000}
            height={1000}
            src="/shop/dress3.jpeg"
            alt="image"
          />
        </div>
        <div className={styles.strip2} id="strip2-shop">
          <Image
            width={1000}
            height={1000}
            src="/shop/dress5.JPG"
            alt="image"
          />
          <Image
            width={1000}
            height={1000}
            src="/shop/dress6.jpeg"
            alt="image"
          />
          <Image
            width={1000}
            height={1000}
            src="/shop/dress1.jpeg"
            alt="image"
          />
          <Image
            width={1000}
            height={1000}
            src="/shop/dress8.JPG"
            alt="image"
          />
        </div>
      </div>
    </div>
  );
};

export default Section2;
