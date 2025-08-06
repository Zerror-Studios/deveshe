import React, { useLayoutEffect, useMemo, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Loader = ({ triggerAnimation = true, homeRef }) => {
  const loaderRef = useRef(null);

  const logoText = useMemo(
    () =>
      "De ve she dreams"
        .split("")
        .map((char, i) => (
          <span key={i}>{char === " " ? "\u00A0" : char}</span>
        )),
    []
  );

  useLayoutEffect(() => {
    if (!triggerAnimation || !homeRef?.current) return;

    const ctx = gsap.context(() => {
      // Initial styles
      gsap.set(".loader_ig", {
        clipPath: "polygon(20% 100%, 80% 100%, 80% 100%, 20% 100%)",
      });
      gsap.set(homeRef.current, {
        overflow: "hidden",
        height: "100vh",
        clipPath: "polygon(20% 100%, 80% 100%, 80% 100%, 20% 100%)",
      });
      gsap.set(loaderRef.current, { display: "flex" });
      gsap.set("#loader_content p", { y: "100%" });
      gsap.set(".counter_strip", { y: "25%" });
      gsap.set("#loader_logo h2 span", { y: "0%" });
      gsap.set(homeRef.current.querySelector("#home_banner img"), {
        scale: 0.9,
      });

      const tl = gsap.timeline();
      const easeExpo = "expo.inOut";
      const easePower = "power2.inOut";
      const staggerSmall = { amount: 0.2 };
      const staggerBig = { amount: 0.3 };

      tl.to("#loader_content p", {
        y: 0,
        stagger: staggerBig,
        delay: 1,
        ease: "power3.out",
      })
        .to(".counter_strip", {
          y: 0,
          stagger: staggerSmall,
          ease: "power3.out",
        })
        .to(".counter_strip", {
          y: "0%",
          stagger: staggerSmall,
          delay: 0.1,
          ease: easePower,
        })
        .to(".counter_strip", {
          y: "-25%",
          stagger: staggerSmall,
          delay: 0.1,
          ease: easePower,
        })
        .to(".counter_strip", {
          y: "-50%",
          stagger: staggerSmall,
          delay: 0.1,
          ease: easePower,
        })
        .to(".counter_strip", {
          y: "-75%",
          stagger: staggerSmall,
          delay: 0.1,
          ease: easePower,
        })
        .to("#loader_content p,.counter_strip ,#loader_logo h2 span", {
          y: "-100%",
          stagger: staggerBig,
          duration: 0.8,
          ease: "power4.inOut",
        })
        .to("#loader_logo", { top: "0%", duration: 1, ease: easeExpo }, "a")
        .to(
          "#loader_ig1",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            scale: 1.1,
            ease: easeExpo,
            duration: 1,
          },
          "a"
        )
        .to(
          "#loader_ig1 img",
          { objectPosition: "50% 10%", ease: easeExpo, duration: 1 },
          "a"
        )
        .to(
          "#loader_ig2",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            backgroundPosition: "50% 10%",
            scale: 1.1,
            ease: easeExpo,
            duration: 1,
          },
          "b"
        )
        .to(
          "#loader_ig2 img",
          { objectPosition: "50% 10%", ease: easeExpo, duration: 1 },
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
          homeRef.current,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: easeExpo,
            duration: 1,
          },
          "d"
        )
        .to(
          homeRef.current.querySelector("#home_hero > img"),
          {
            scale: 1.1,
            duration: 1,
            delay: 0.3,
            ease: "none",
          },
          "d"
        )
        .set(
          homeRef.current,
          {
            overflow: "visible",
            height: "100%",
            onComplete: () => setTimeout(() => ScrollTrigger.refresh(), 500),
          },
          "s"
        )
        .set(loaderRef.current, { display: "none" }, "s");
    }, loaderRef);

    return () => ctx.revert();
  }, [triggerAnimation, homeRef]);

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
          <span>1</span>
          <span>4</span>
          <span>9</span>
        </div>
        <div className="counter_strip counter_strip2">
          <span>0</span>
          <span>2</span>
          <span>6</span>
          <span>9</span>
        </div>
      </div>

      <div id="loader_logo">
        <h2>{logoText}</h2>
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
