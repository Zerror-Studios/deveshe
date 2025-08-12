import React from "react";
import { useCartStore } from "@/store/cart-store";
import Navbar from "@/components/common/Navbar";
import NavbarMobile from "@/components/common/NavbarMobile";
import Footer from "@/components/common/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
const Layout = ({ children }) => {
  const { isCartOpen, openCart, closeCart } = useCartStore((state) => state);

  return (
    <>
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
