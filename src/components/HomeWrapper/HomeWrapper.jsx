import React, { useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../common/Navbar";
import HeaderLogo from "../common/HeaderLogo";
import NavbarMobile from "../common/NavbarMobile";
import Footer from "../common/Footer";
import Navbar2 from "../common/Navbar2";

const HomeWrapper = ({ children, openBag, setOpenBag }) => {
  const router = useRouter();

  return (
    <div className="home-wrapper">
      {router.pathname !== "/" ? <Navbar2 openBag={openBag} setOpenBag={setOpenBag} /> : <Navbar openBag={openBag} setOpenBag={setOpenBag} />}
      {children}
      <Footer />
    </div>
  );
};

export default HomeWrapper;
