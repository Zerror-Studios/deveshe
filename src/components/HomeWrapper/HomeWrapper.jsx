import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../common/Navbar";
import NavbarMobile from "../common/NavbarMobile";
import Footer from "../common/Footer";
import Navbar2 from "../common/Navbar2";

const HomeWrapper = ({ children, openBag, setOpenBag }) => {
  const router = useRouter();
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <div className="home-wrapper">
      {router.pathname !== "/" ? (
        <Navbar2 openBag={openBag} setOpenBag={setOpenBag} />
      ) : (
        <Navbar openBag={openBag} setOpenBag={setOpenBag} />
      )}
      <NavbarMobile openBag={openBag} setOpenBag={setOpenBag} />
      {children}
      <Footer />
    </div>
  );
};

export default HomeWrapper;
