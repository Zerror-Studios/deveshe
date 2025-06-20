import React, { useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../common/Navbar";
import HeaderLogo from "../common/HeaderLogo";
import NavbarMobile from "../common/NavbarMobile";
import Footer from "../common/Footer";

const HomeWrapper = ({ children, openBag, setOpenBag }) => {

  return (
    <div className="home-wrapper">
      <Navbar openBag={openBag} setOpenBag={setOpenBag} />
      <NavbarMobile openBag={openBag} setOpenBag={setOpenBag} />
      {children}
      <Footer />
    </div>
  );
};

export default HomeWrapper;
