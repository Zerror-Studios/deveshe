import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Loader = ({ triggerAnimation = true }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!triggerAnimation) return;

    // Set initial styles
    gsap.set(".loader_ig", {
      clipPath: "polygon(20% 100%, 80% 100%, 80% 100%, 20% 100%)",
    });
    gsap.set(".home-wrapper", {
      overflow: "hidden",
      height: "100vh",
      clipPath: "polygon(20% 100%, 80% 100%, 80% 100%, 20% 100%)",
    });

    gsap.set(loaderRef.current, { display: "flex" });
    gsap.set("#loader_content p", { transform: "translateY(100%)" });
    gsap.set(".counter_strip", { transform: "translateY(50%)" });
    gsap.set("#loader_logo h2 span", { transform: "translateY(0%)" });
    gsap.set(".home-wrapper #home_banner img", { scale: 0.9 });

    const tl = gsap.timeline();

    tl.to("#loader_content p", {
      y: 0,
      stagger: { amount: 0.3 },
      delay: 1,
      ease: "power3.out",
    })
      .to(".counter_strip", {
        y: 0,
        stagger: { amount: 0.2 },
        ease: "power3.out",
      })
      .to(".counter_strip", {
        y: "-50%",
        stagger: { amount: 0.2 },
        delay: 0.1,
        ease: "power2.inOut",
      })
      .to("#loader_content p,.counter_strip ,#loader_logo h2 span", {
        y: "-100%",
        stagger: { amount: 0.3 },
        duration: 0.8,
        ease: "power4.inOut",
      })
      .to("#loader_logo", { top: "0%", duration: 1, ease: "expo.inOut" }, "a")
      .to(
        "#loader_ig1",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          scale: 1.1,
          ease: "expo.inOut",
          duration: 1,
        },
        "a"
      )
      .to(
        "#loader_ig1 img",
        { objectPosition: "50% 10%", ease: "expo.inOut", duration: 1 },
        "a"
      )
      .to(
        "#loader_ig2",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          backgroundPosition: "50% 10%",
          scale: 1.1,
          ease: "expo.inOut",
          duration: 1,
        },
        "b"
      )
      .to(
        "#loader_ig2 img",
        { objectPosition: "50% 10%", ease: "expo.inOut", duration: 1 },
        "b"
      )
      .to(
        "#loader_ig1",
        { scale: 1.2, duration: 1, delay: -0.5, ease: "none" },
        "b"
      )
      .to(
        "#loader_ig2",
        { scale: 1.2, duration: 1, delay: -0.5, ease: "none" },
        "d"
      )
      .to(
        ".home-wrapper",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "expo.inOut",
          duration: 1,
        },
        "d"
      )
      .to(
        ".home-wrapper #home_hero >img",
        {
          scale: 1.1,
          duration: 1,
          delay: 0.3,
          ease: "none",
        },
        "d"
      )
      .set(
        ".home-wrapper",
        {
          overflow: "visible",
          height: "100%",
          onComplete: () => setTimeout(() => ScrollTrigger.refresh(), 500),
        },
        "s"
      )
      .set(loaderRef.current, { display: "none" }, "s");
  }, [triggerAnimation]);

  return (
    <div ref={loaderRef} id="loader_main">
      <div id="loader_content">
        <div className="content">
          <p>campaigns</p>
          <p>editorial</p>
        </div>
        <div className="content">
          <p>celebrities</p>
          <p>beauty</p>
        </div>
      </div>
      <div id="loader_counter">
        <div className="counter_strip counter_strip1">
          <span>0</span>
          <span>9</span>
        </div>
        <div className="counter_strip counter_strip2">
          <span>0</span>
          <span>9</span>
        </div>
      </div>
      <div id="loader_logo">
        <h2>
          {"De ve she dreams".split("").map((char, i) => (
            <span key={i}>{char === " " ? "\u00A0" : char}</span>
          ))}
        </h2>
      </div>
      <div id="loader_ig1" className="loader_ig">
        <Image
          src="/assets/images/loader/slide1.webp"
          width={1000}
          height={1000}
          alt="loader1"
        />
      </div>
      <div id="loader_ig2" className="loader_ig">
        <Image
          src="/assets/images/loader/slide2.webp"
          width={1000}
          height={1000}
          alt="loader2"
        />
      </div>
    </div>
  );
};

export default Loader;
