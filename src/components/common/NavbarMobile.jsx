import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Button from "./Button";
import { useAuthStore } from "@/store/auth-store";
gsap.registerPlugin(ScrollTrigger);

const NavbarMobile = ({openCart}) => {
  const { isLoggedIn } = useAuthStore((state) => state);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTL = useRef(null);

  useGSAP(() => {
    menuTL.current = gsap
      .timeline({ paused: true })
      .to(
        ".line1m",
        {
          top: "50%",
          transform: "translateY(-50%)",
          duration: 0.2,
        },
        "a"
      )
      .to(
        ".line2m",
        {
          top: "50%",
          transform: "translateY(-50%)",
          duration: 0.2,
        },
        "a"
      )
      .to(
        ".line1m",
        {
          rotate: 45,
          duration: 0.2,
        },
        "b"
      )
      .to(
        ".line2m",
        {
          rotate: -45,
          duration: 0.2,
        },
        "b"
      )
      .to(
        "#side-navbar",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.3,
          ease: "power2.out",
        },
        "a"
      )
      .to(
        ".side-menu-links",
        {
          y: 50,
          duration: 0.3,
        },
        "a"
      );

    document.querySelectorAll(".side-menu-links a").forEach((link) => {
      link.addEventListener("click", () => {
        setIsMenuOpen(false);
        menuTL.current.reverse();
      });
    });
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const newState = !prev;
      if (newState) {
        menuTL.current.play();
      } else {
        menuTL.current.reverse();
      }
      return newState;
    });
  };

  return (
    <>
      <div className="navbar-mobile">
        <Link href="/" id="nav-logo">
          <Image width={1000} height={1000} src="/assets/images/logo/d.webp" alt="D" />
          <Image width={1000} height={1000} src="/assets/images/logo/v.webp" alt="V" />
          <Image width={1000} height={1000} src="/assets/images/logo/s.webp" alt="S" />
          <Image width={1000} height={1000} src="/assets/images/logo/m.webp" alt="M" />
        </Link>
        <div className="menu-icons">
          <Link href={isLoggedIn ? "/profile" : "/login"}>
            <Image
              className="account-logo"
              width={23}
              height={23}
              src="/images/user.png"
              alt="logo"
            />
          </Link>
          <HiOutlineShoppingBag
            onClick={openCart}
            className="bag-icon"
            size={23}
          />
          <div id="menu-btn" onClick={toggleMenu}>
            <span className="line1m linem"></span>
            <span className="line2m linem"></span>
          </div>
        </div>
        <div id="side-navbar">
          <div className="side-menu-links">
            <div className="nav-top">
              <Link href="/login" className="login-nav">
                <Button className="_btn-width">Login / Signup</Button>
              </Link>
              <Link href="/">shop</Link>
              <Link href="/lookbook">lookbook</Link>
              <Link href="/about">about</Link>
              <Link href="/contact">contact</Link>
            </div>
            <div className="nav-wrapper">
              <div className="nav-contact">
                <p>contact us</p>
                <p>
                  deveshedreams@gmail.com <br />
                  +919833983775
                </p>
              </div>
              <div className="nav-social-icons">
                 <a href="https://www.instagram.com/de_ve_she_dreams" className="nav-s-icon" target="_blank">
                  <svg
                    className="icon-instagram"
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    data-v-f756b3ad=""
                  >
                    <path
                      d="M9.49745 4.62558C6.80005 4.62558 4.62312 6.80255 4.62312 9.5C4.62312 12.1974 6.80005 14.3744 9.49745 14.3744C12.1948 14.3744 14.3718 12.1974 14.3718 9.5C14.3718 6.80255 12.1948 4.62558 9.49745 4.62558ZM9.49745 12.668C7.75305 12.668 6.32949 11.2444 6.32949 9.5C6.32949 7.75557 7.75305 6.33198 9.49745 6.33198C11.2418 6.33198 12.6654 7.75557 12.6654 9.5C12.6654 11.2444 11.2418 12.668 9.49745 12.668ZM14.5714 3.28993C13.9416 3.28993 13.433 3.79852 13.433 4.42832C13.433 5.05812 13.9416 5.56672 14.5714 5.56672C15.2012 5.56672 15.7098 5.0605 15.7098 4.42832C15.71 4.27877 15.6806 4.13066 15.6235 3.99246C15.5664 3.85426 15.4825 3.72869 15.3768 3.62294C15.271 3.51719 15.1455 3.43335 15.0073 3.3762C14.8691 3.31906 14.721 3.28974 14.5714 3.28993ZM18.9989 9.5C18.9989 8.18811 19.0108 6.88811 18.9371 5.5786C18.8635 4.05757 18.5165 2.70766 17.4043 1.59541C16.2897 0.480781 14.9421 0.136173 13.4211 0.0624986C12.1093 -0.0111762 10.8093 0.000706907 9.49982 0.000706907C8.18796 0.000706907 6.88798 -0.0111762 5.5785 0.0624986C4.0575 0.136173 2.70761 0.483158 1.59538 1.59541C0.480772 2.71004 0.136171 4.05757 0.0624975 5.5786C-0.0111759 6.89049 0.000706894 8.19049 0.000706894 9.5C0.000706894 10.8095 -0.0111759 12.1119 0.0624975 13.4214C0.136171 14.9424 0.483149 16.2923 1.59538 17.4046C2.70999 18.5192 4.0575 18.8638 5.5785 18.9375C6.89036 19.0112 8.19034 18.9993 9.49982 18.9993C10.8117 18.9993 12.1117 19.0112 13.4211 18.9375C14.9421 18.8638 16.292 18.5168 17.4043 17.4046C18.5189 16.29 18.8635 14.9424 18.9371 13.4214C19.0132 12.1119 18.9989 10.8119 18.9989 9.5ZM16.9076 15.104C16.7341 15.5366 16.5249 15.8598 16.1898 16.1925C15.8547 16.5276 15.5339 16.7368 15.1014 16.9103C13.8513 17.407 10.883 17.2953 9.49745 17.2953C8.11191 17.2953 5.14121 17.407 3.89114 16.9126C3.4586 16.7391 3.13539 16.53 2.80267 16.1949C2.46758 15.8598 2.25844 15.539 2.08495 15.1064C1.59063 13.8539 1.70232 10.8856 1.70232 9.5C1.70232 8.11444 1.59063 5.14368 2.08495 3.89359C2.25844 3.46104 2.46758 3.13783 2.80267 2.8051C3.13777 2.47238 3.4586 2.26086 3.89114 2.08737C5.14121 1.59303 8.11191 1.70473 9.49745 1.70473C10.883 1.70473 13.8537 1.59303 15.1038 2.08737C15.5363 2.26086 15.8595 2.47 16.1922 2.8051C16.5273 3.1402 16.7365 3.46104 16.9099 3.89359C17.4043 5.14368 17.2926 8.11444 17.2926 9.5C17.2926 10.8856 17.4043 13.8539 16.9076 15.104Z"
                      fill="white"
                    ></path>
                  </svg>
                </a>
                <Link href="/ " className="nav-s-icon">
                  <svg
                    className="icon-facebook"
                    width="8"
                    height="13"
                    viewBox="0 0 8 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    data-v-f756b3ad=""
                  >
                    <path
                      d="M7.51291 0.359863H5.61961C4.78272 0.359863 3.9801 0.692317 3.38833 1.28409C2.79656 1.87586 2.4641 2.67848 2.4641 3.51537V5.40867H0.570801V7.93307H2.4641V12.9819H4.98851V7.93307H6.88181L7.51291 5.40867H4.98851V3.51537C4.98851 3.34799 5.055 3.18747 5.17335 3.06911C5.29171 2.95076 5.45223 2.88427 5.61961 2.88427H7.51291V0.359863Z"
                      fill="#141414"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarMobile;
