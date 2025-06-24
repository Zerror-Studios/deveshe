import React from "react";
import { useRouter } from "next/router";
import Navbar from "../common/Navbar";
import NavbarMobile from "../common/NavbarMobile";
import Footer from "../common/Footer";

const HomeWrapper = ({ children, openBag, setOpenBag }) => {
  const router = useRouter();

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
