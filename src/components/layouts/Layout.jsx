import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useRouter } from "next/router";
import { useCartStore } from "@/store/cart-store";
import Navbar from "@/components/common/Navbar";
import NavbarMobile from "@/components/common/NavbarMobile";
import Footer from "@/components/common/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const Layout = ({ children }) => {
  const router = useRouter();
  const loaderRef = useRef(null);
  const { isCartOpen, openCart, closeCart } = useCartStore((state) => state);

  useEffect(() => {
    // Initial states
    if (router.pathname !== "/") {
      gsap.set(".home-wrapper", {
        overflow: "visible",
        height: "100%",
        clipPath: "none",
      });
      return;
    }
    gsap.set(".home-wrapper", {
      overflow: "hidden",
      height: "100vh",
      clipPath: "polygon(20% 100%, 80% 100%, 80% 100%, 20% 100%)",
    });

    gsap.set(loaderRef.current, {
      display: "flex",
    });

    gsap.set("#loader_content p", {
      transform: "translateY(100%)",
    });
    gsap.set(".counter_strip", {
      transform: "translateY(50%)",
    });
    gsap.set("#loader_logo h2 span", {
      transform: "translateY(0%)",
    });
    gsap.set(".home-wrapper #home_banner img", {
      scale: 0.9,
    });

    const tl = gsap.timeline();

    tl.to("#loader_content p", {
      y: 0,
      stagger: {
        amount: 0.3,
      },
      delay: 1,
      ease: "power3.out",
    })
      .to(".counter_strip", {
        y: 0,
        stagger: {
          amount: 0.2,
        },
        ease: "power3.out",
      })
      .to(".counter_strip", {
        y: "-50%",
        stagger: {
          amount: 0.2,
        },
        delay: 0.1,
        ease: "power2.inOut",
      })
      .to("#loader_content p,.counter_strip ,#loader_logo h2 span", {
        y: "-100%",
        stagger: {
          amount: 0.3,
        },
        duration: 0.8,
        ease: "power4.inOut",
      })
      .to(
        "#loader_logo",
        {
          top: "0%",
          duration: 1,
          ease: "expo.inOut",
        },
        "a"
      )
      .to(
        "#loader_ig1",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          backgroundPosition: "50% 10%",
          scale:1.1,
          ease: "expo.inOut",
          duration: 1,
        },
        "a"
      )
      .to(
        "#loader_ig2",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          backgroundPosition: "50% 10%",
          scale:1.1,
          ease: "expo.inOut",
          duration: 1,
        },
        "b"
      )
      .to(
        "#loader_ig1",
        {
          scale: 1.2,
          duration: 1,
          ease: "power2.inOut",
        },
        "b"
      )
       .to(
        "#loader_ig2",
        {
          scale: 1.2,
          duration: 1,
          ease: "none",
        },
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
        ".home-wrapper #home_banner img",
        {
          scale: 1,
          duration: 1,
          ease: "none",
        },
        "d"
      )
      .to(
        "#loader_ig3",
        {
          scale: 1.2,
          duration: 0.8,
          ease: "none",
        },
        "d"
      )
      .set(
        ".home-wrapper",
        {
          overflow: "visible",
          height: "100%",
        },
        "s"
      )
      .set(
        loaderRef.current,
        {
          display: "none",
        },
        "s"
      );
  }, [router.asPath]);

  return (
    <>
      {router.pathname === "/" && (
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
              {"De ve she dreams".split("").map((char, index) => (
                <span key={index}>{char === " " ? "\u00A0" : char}</span>
              ))}
            </h2>
          </div>
          <div id="loader_ig1" className="loader_ig"></div>
          <div id="loader_ig2" className="loader_ig"></div>
          <div id="loader_ig3" className="loader_ig"></div>
        </div>
      )}
      <div className="home-wrapper">
        <Navbar openCart={openCart} />
        <NavbarMobile openCart={openCart} />
        {children}
        <Footer />
        <CartDrawer isOpen={isCartOpen} closeCart={closeCart} />
      </div>
    </>
  );
};

export default Layout;
