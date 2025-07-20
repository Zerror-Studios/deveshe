import React from "react";
import Navbar from "@/components/common/Navbar";
import NavbarMobile from "@/components/common/NavbarMobile";
import Footer from "@/components/common/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const Layout = ({ children }) => {
  return (
    <>
      <div className="home-wrapper">
        <Navbar />
        <NavbarMobile />
        {children}
        <Footer />
        <CartDrawer />
      </div>
    </>
  );
};

export default Layout;
