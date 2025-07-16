import React from "react";
import Navbar from "@/components/common/Navbar";
import NavbarMobile from "@/components/common/NavbarMobile";
import Footer from "@/components/common/Footer";

const Layout = ({ children }) => {
  return (
    <div className="home-wrapper">
      <Navbar />
      <NavbarMobile />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
