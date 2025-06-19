import React, {useEffect, useRef} from "react";
import HomeSlider from "../HomeSlider/HomeSlider";
import { useRouter } from "next/router";
import gsap from "gsap";
import Navbar from "../common/Navbar";
import HeaderLogo from "../common/HeaderLogo";
import NavbarMobile from "../common/NavbarMobile";
import Footer from "../common/Footer";

const HomeWrapper = ({ children, openBag, setOpenBag  }) => {
  const route = useRouter();
  const homeRef = useRef(null);
  // const headerRef = useRef(null);
  const headerLogo = useRef(null);
  const headerNav = useRef(null);

  // useEffect(() => {
  //   const setVh = () => {
  //     document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  //   };
  //   setVh();
  //   window.addEventListener('resize', setVh);
  //   return () => window.removeEventListener('resize', setVh);
  // }, []);
  



  // // Set initial position based on localStorage (fixes direct jump issue)
  // useEffect(() => {
  //   const previousRoute = localStorage.getItem("previousRoute");
  //   if (!previousRoute || previousRoute !== "/") {
  //     gsap.set(homeRef.current, { y: "-100%" });
  //     gsap.set(headerNav.current, { top: "80px" });
  //     gsap.set(headerLogo.current, { opacity: 1, top: "0%" });
  //   } else {
  //     gsap.set(homeRef.current, { y: "0%" });
  //     gsap.set(headerNav.current, { top: "calc(100dvh - 65px)" });
  //     gsap.set(headerLogo.current, { opacity: 0, top: "calc(100vh - 130px)" });
  //   }
  // }, []);

  // useEffect(() => {
  //   const previousRoute = localStorage.getItem("previousRoute");

  //   // Save the current route for the next navigation
  //   localStorage.setItem("previousRoute", route.pathname);

  //   // If both previous and current routes are NOT "/", stay at -90% (prevents shivering)
  //   if (previousRoute !== "/" && route.pathname !== "/") {
  //     return;
  //   }

  //   // If previous route was "/" and current route is NOT "/", move to -90%
  //   if (previousRoute === "/" && route.pathname !== "/") {
  //     var tl = gsap.timeline()
  //     tl
  //       .to(homeRef.current, {
  //         y: "-100%",
  //         duration: 1,
  //         ease: "power2.out",
  //       })
  //       .to(headerNav.current, {
  //         top: "80px",
  //         duration: 0.8,
  //         ease: "power2.out",
  //         delay: -0.4
  //       }, "a")
  //       .to(headerLogo.current, {
  //         opacity: 1,
  //         top: "0%",
  //         duration: 0.8,
  //         ease: "power2.out",
  //         delay: -0.4
  //       }, "a")
  //   }


  //   // If previous route was NOT "/" and current route IS "/", move to 0%
  //   if (previousRoute !== "/" && route.pathname === "/") {
  //     var home = gsap.timeline();
  //     home
  //       .to(headerLogo.current, {
  //         opacity: 0,
  //         top: "calc(100vh - 130px)",
  //         duration: 0.8,
  //         ease: "power2.out",
  //       }, "a")
  //       .to(headerNav.current, {
  //         top: "calc(100dvh - 65px)",
  //         duration: 0.8,
  //         ease: "power2.out",
  //       }, "a")
  //       .to(homeRef.current, {
  //         y: "0%",
  //         duration: .6,
  //         ease: "power2.out",
  //       })
  //   }
  // }, [route.pathname]);



  return (
    <div className="home-wrapper">
      {/* <HomeSlider homeRef={homeRef} /> */}
      <HeaderLogo headerLogo={headerLogo} />
      <Navbar headerNav={headerNav} openBag={openBag} setOpenBag={setOpenBag}/>
      <NavbarMobile openBag={openBag} setOpenBag={setOpenBag}/>
      {children}
      <Footer/>
    </div>
  );
};

export default HomeWrapper;
