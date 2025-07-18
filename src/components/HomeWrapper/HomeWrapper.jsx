import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../common/Navbar";
import NavbarMobile from "../common/NavbarMobile";
import Footer from "../common/Footer";
import Image from "next/image";
import gsap from "gsap";

const HomeWrapper = ({ children, openBag, setOpenBag }) => {
  const router = useRouter();
  const loaderRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    if (router.pathname === "/") {
      const tl = gsap.timeline({ defaults: { delay: 1 } });

      // Animate counter from 0 to 100
      let counterObj = { val: 0 };
      gsap.to(counterObj, {
        val: 100,
        duration: 3, // made slightly slower
        ease: "power2.out",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.innerText = `${Math.floor(counterObj.val)}%`;
          }
        },
      });

      tl
        // Phase A: Lines + logo fade in
        .to(
          ".logo-loader",
          {
            filter: "blur(0px)",
            duration: 0.8,
          },
          "a"
        )
        .to(
          ".line-top-l",
          {
            width: "calc(100% - 60px)",
            duration: 0.8,
            ease: "power1.in",
          },
          "a"
        )
        .to(
          ".line-bottom-l",
          {
            width: "calc(100% - 60px)",
            duration: 0.8,
            ease: "power1.in",
          },
          "a"
        )
        .to(
          ".line-side-l",
          {
            height: "calc(100% - 60px)",
            duration: 0.8,
            ease: "power1.in",
          },
          "a"
        )
        .to(
          ".line-side-r",
          {
            height: "calc(100% - 60px)",
            duration: 0.8,
            ease: "power1.in",
          },
          "a"
        )

        // Phase B: Lines and logo fade out
        .to(
          ".logo-loader",
          {
            filter: "blur(8px)",
            opacity: 0,
            duration: 0.8,
          },
          "b"
        )
        .to(
          ".line-top-l",
          {
            width: "0",
            duration: 0.8,
            ease: "power1.in",
          },
          "b"
        )
        .to(
          ".line-bottom-l",
          {
            width: "0",
            duration: 0.8,
            ease: "power1.in",
          },
          "b"
        )
        .to(
          ".line-side-l",
          {
            height: "0",
            duration: 0.8,
            ease: "power1.in",
          },
          "b"
        )
        .to(
          ".line-side-r",
          {
            height: "0",
            duration: 0.8,
            ease: "power1.in",
          },
          "b"
        )
        .to(
          "#counter",
          {
            opacity: 0,
            duration: 0.8,
          },
          "b"
        )

       // Phase C: Fade out loader-main
.to(
  loaderRef.current,
  {
    opacity: 0,
    duration: .8, // smooth fade-out
    delay:-.1,
    ease: "power1.out",
    onComplete: () => {
      if (loaderRef.current) {
        loaderRef.current.style.display = "none";
      }
    },
  },
  "c"
);

    }
  }, [router.pathname]);

  return (
    <div className="home-wrapper">
      {router.pathname === "/" && (
        <div ref={loaderRef} id="loader-main">
          <div className="loader-left"></div>
          <div className="loader-right"></div>
          <div className="line-top-l"></div>
          <div className="line-side-l"></div>
          <div className="line-side-r"></div>
          <div className="line-bottom-l"></div>
          <h2 id="counter" ref={counterRef}>
            0%
          </h2>
          <div className="logo-loader">
            <Image
              width={1000}
              height={1000}
              src="/logo/d.png"
              alt="D"
              className="logo-l"
            />
            <Image
              width={1000}
              height={1000}
              src="/logo/v.png"
              alt="V"
              className="logo-l"
            />
            <Image
              width={1000}
              height={1000}
              src="/logo/s.png"
              alt="S"
              className="logo-l"
            />
            <Image
              width={1000}
              height={1000}
              src="/logo/m.png"
              alt="M"
              className="logo-l"
            />
          </div>
        </div>
      )}

      <Navbar openBag={openBag} setOpenBag={setOpenBag} />
      <NavbarMobile openBag={openBag} setOpenBag={setOpenBag} />
      {children}
      <Footer />
    </div>
  );
};

export default HomeWrapper;
