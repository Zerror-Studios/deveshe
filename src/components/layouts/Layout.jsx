import React from "react";
import { useCartStore } from "@/store/cart-store";
import Navbar from "@/components/common/Navbar";
import NavbarMobile from "@/components/common/NavbarMobile";
import CartDrawer from "../cart/CartDrawer";
import Footer from "../common/Footer";
import ConsentBanner from "../common/ConsentBanner";
import NoiseOverlay from "../common/NoiseOverlay";
import AssistantLauncher from "../assistant/AssistantLauncher";
const Layout = ({ children }) => {
  const { isCartOpen, openCart, closeCart } = useCartStore((state) => state);

  return (
    <>
      <div className="home-wrapper">
        <NoiseOverlay />
        <Navbar openCart={openCart} />
        <NavbarMobile openCart={openCart} />
        {children}
        <Footer />
        <CartDrawer isOpen={isCartOpen} closeCart={closeCart} />
        {/* DD-PRD-001: bottom right, not on checkout or payment pages */}
        <AssistantLauncher />
        <ConsentBanner />
      </div>
    </>
  );
};

export default Layout;
