import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useCartStore } from "@/store/cart-store";
import Navbar from "@/components/common/Navbar";
import NavbarMobile from "@/components/common/NavbarMobile";
import Footer from "@/components/common/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import Loader from "../loader/Loader";
import gsap from "gsap";

const Layout = ({ children }) => {
  const router = useRouter();
  const homeRef = useRef();
  const { isCartOpen, openCart, closeCart } = useCartStore((state) => state);

  // Apply layout styles for non-home routes
  useLayoutEffect(() => {
    if (router.pathname !== "/" && homeRef.current) {
      gsap.set(homeRef.current, {
        overflow: "visible",
        height: "100%",
        clipPath: "none",
      });
    }
  }, [router.pathname]);

  return (
    <>
      {router.pathname === "/" && (
        <Loader triggerAnimation={true} homeRef={homeRef} />
      )}
      <div ref={homeRef} className="home-wrapper">
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
