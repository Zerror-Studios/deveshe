import { LuMenu } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { useRouter } from "next/router";
import Modal from "./Modal";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { VscAccount } from "react-icons/vsc";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Image from "next/image";
import { ModalContext } from "../context/ModalProvider";
import Button from "./Button";
gsap.registerPlugin(ScrollTrigger);

const NavbarMobile = ({ openBag, setOpenBag, headerNav }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = router.pathname;
  const pathName = router.pathname.split("/")[1];
  const [modalIsOpen, setModalIsOpen] = useContext(ModalContext);
  const user = useSelector((state) => state.user.user);
  const cartCount = useSelector((state) => state.cart.itemcount);
  const menuTL = useRef(null);

  const openModal = () => setModalIsOpen(true);

  const closeModal = () => {
    setModalIsOpen(false);
    setOpenBag(false);
  };

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
          <Image width={1000} height={1000} src="/logo/d.png" alt="D" />
          <Image width={1000} height={1000} src="/logo/v.png" alt="V" />
          <Image width={1000} height={1000} src="/logo/s.png" alt="S" />
          <Image width={1000} height={1000} src="/logo/m.png" alt="M" />
        </Link>
        <div className="menu-icons">
          <Link href="/profile">
            <Image
              className="account-logo"
              width={23}
              height={23}
              src="/images/user.png"
            />
          </Link>
          <HiOutlineShoppingBag
            onClick={openModal}
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
                  info@deveshe.com <br />
                  +91893990000
                </p>
              </div>
               <div className="nav-social-icons">
                <Link href="/" className="nav-s-icon">
                  <svg
                    class="icon-instagram"
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
                </Link>
                {/* <Link href={} className="nav-s-icon">
                  <svg
                    class="icon-twitter"
                    width="13"
                    height="11"
                    viewBox="0 0 13 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    data-v-f756b3ad=""
                  >
                    <path
                      d="M12.93 1.82817C12.4633 2.02643 11.9554 2.16912 11.4322 2.22469C11.9754 1.90692 12.3821 1.40491 12.5762 0.812828C12.0665 1.11141 11.5081 1.32077 10.9258 1.43164C10.6825 1.17545 10.3881 0.971347 10.0611 0.832064C9.73418 0.692782 9.38159 0.621302 9.02534 0.622077C7.58396 0.622077 6.42476 1.77259 6.42476 3.18445C6.42476 3.38271 6.44916 3.58098 6.48882 3.77173C4.33057 3.66058 2.40568 2.64524 1.12599 1.09069C0.892811 1.48288 0.77062 1.92944 0.772124 2.3839C0.772124 3.27307 1.23123 4.0571 1.93133 4.51821C1.51875 4.50221 1.11583 4.39054 0.755346 4.19228V4.22382C0.755346 5.46896 1.64915 6.50082 2.84038 6.73814C2.61672 6.79535 2.38663 6.82462 2.15554 6.82525C1.98624 6.82525 1.82608 6.80873 1.6644 6.7862C1.99386 7.80154 2.95325 8.53901 4.09568 8.56304C3.20187 9.25245 2.08233 9.65798 0.866691 9.65798C0.648578 9.65798 0.447243 9.65047 0.238281 9.62644C1.39138 10.3549 2.75955 10.7755 4.23295 10.7755C9.01618 10.7755 11.6335 6.87331 11.6335 3.48635C11.6335 3.3752 11.6335 3.26406 11.6259 3.15291C12.1323 2.78793 12.5762 2.33583 12.93 1.82817Z"
                      fill="#141414"
                    ></path>
                  </svg>
                </Link>
                <Link href={} className="nav-s-icon">
                  <svg
                    class="icon-dribbble"
                    width="11"
                    height="12"
                    viewBox="0 0 11 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    data-v-f756b3ad=""
                  >
                    <path
                      d="M10.0714 3.29352C9.60331 2.48228 8.92962 1.80878 8.11825 1.34089C7.2959 0.861857 6.39844 0.62207 5.42588 0.62207C4.45332 0.62207 3.55587 0.861857 2.73297 1.34089C1.91062 1.81993 1.25938 2.47116 0.780347 3.29352C0.30131 4.11588 0.0615234 5.01387 0.0615234 5.98643C0.0615234 6.95899 0.300774 7.85698 0.780347 8.67934C1.24829 9.4907 1.92202 10.1642 2.73351 10.632C3.55587 11.111 4.45332 11.3508 5.42588 11.3508C6.39844 11.3508 7.2959 11.111 8.11879 10.632C8.93016 10.1641 9.60384 9.49057 10.072 8.67934C10.551 7.85698 10.7902 6.95899 10.7902 5.98643C10.7902 5.01387 10.551 4.11588 10.0714 3.29352ZM5.42588 1.51255C6.49875 1.51255 7.44932 1.85587 8.27972 2.54197C7.7862 3.17175 7.05343 3.68995 6.08033 4.09764C5.54282 3.12508 4.96025 2.31292 4.33102 1.66222C4.68764 1.56361 5.05588 1.51328 5.42588 1.51255ZM1.94441 3.19696C2.33668 2.69884 2.833 2.29241 3.39869 2.00607C4.04885 2.65033 4.6459 3.45445 5.19039 4.42004C4.11751 4.7419 2.98349 4.90283 1.78885 4.90283C1.48147 4.90283 1.24919 4.89585 1.09148 4.88137C1.25588 4.26682 1.54635 3.6932 1.94441 3.19696ZM0.952007 5.98643C0.952007 5.95746 0.953616 5.92206 0.957371 5.87914C0.961126 5.83623 0.962736 5.80082 0.962736 5.77185C1.09899 5.77936 1.30659 5.78258 1.58554 5.78258C3.01568 5.78258 4.34604 5.58571 5.57608 5.1925C5.6764 5.39259 5.78047 5.6179 5.88722 5.86841C5.17912 6.02559 4.45279 6.40807 3.70875 7.01639C2.96471 7.6247 2.42184 8.26467 2.07852 8.93682C1.32751 8.0855 0.952007 7.10221 0.952007 5.98643ZM5.42588 10.4603C4.40987 10.4603 3.49793 10.1454 2.68952 9.51671C3.01192 8.87996 3.50705 8.27111 4.17599 7.69229C4.84439 7.11294 5.50796 6.75192 6.16616 6.60869C6.58136 7.75612 6.86218 8.94781 7.003 10.1599C6.50029 10.3563 5.96561 10.4582 5.42588 10.4603ZM9.22385 8.33602C8.87273 8.90171 8.39993 9.38202 7.83984 9.74201C7.7111 8.62623 7.46434 7.53887 7.1001 6.47995C7.60006 6.44454 8.04691 6.42631 8.44119 6.42631C8.8698 6.42631 9.34562 6.44454 9.86757 6.47995C9.79754 7.13968 9.57734 7.7746 9.22385 8.33602ZM8.55867 5.65384C7.9364 5.65384 7.36081 5.67905 6.83134 5.72894C6.71919 5.43539 6.59754 5.14556 6.46657 4.85991C7.57484 4.3739 8.36126 3.78382 8.82635 3.08967C9.47007 3.8482 9.8209 4.71347 9.87776 5.68602C9.44218 5.66457 9.0023 5.65384 8.55867 5.65384Z"
                      fill="#141414"
                    ></path>
                  </svg>
                </Link> */}
                <Link href="/ " className="nav-s-icon">
                  <svg
                    class="icon-facebook"
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
      <Modal
        closeModal={closeModal}
        modalIsOpen={modalIsOpen}
        setOpenBag={setOpenBag}
        openBag={openBag}
        setModalIsOpen={setModalIsOpen}
      />
    </>
  );
};

export default NavbarMobile;
