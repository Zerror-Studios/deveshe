import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import gsap from "gsap";
import Modal from "./Modal";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import { useRouter } from "next/router";
gsap.registerPlugin(ScrollTrigger);

const Navbar = ({ openBag, setOpenBag }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const cartCount = useSelector((state) => state.cart.itemcount);
  function openModal() {
    setModalIsOpen(true);
  }
  function closeModal() {
    setModalIsOpen(false);
    setOpenBag(false);
  }
  const router = useRouter();

useEffect(() => {
  if (window.innerWidth < 576) return;

  const initLogoAnimation = () => {
    const logos = document.querySelectorAll(".logo");
    const spacing = 10;
    let xPositions = [];
    let currentX = 0;

    logos.forEach((logo) => {
      const width = logo.getBoundingClientRect().width;
      xPositions.push(currentX);
      currentX += width + spacing;
    });

    // Set width based on 4th logo or fallback to total width
    const logoContainer = document.querySelector("#logo-container");
    logoContainer.style.width = `${xPositions[3] || currentX}px`;

    const lastLogo = logos[logos.length - 1];
    const lastLogoWidth = lastLogo.getBoundingClientRect().width;
    const finalWidth = `${xPositions[logos.length - 1] + lastLogoWidth}px`;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "400px 20%",
        scrub: 1,
        // markers: true,
      },
    });

    tl.to(
      ".logo",
      {
        top: 0,
        x: (i) => xPositions[i],
        ease: "sine.out",
      },
      "start"
    )
      .to(
        "#logo-container",
        {
          height: "25px",
          width: finalWidth,
          ease: "sine.out",
        },
        "start"
      )
      .to("#nav", {
        backgroundColor: "rgba(255,255,255,1)",
        duration: 0.3,
        ease: "power1.out",
      }, "s")
      .to("#nav-btns", {
        backgroundColor: "rgba(255,255,255,1)",
        duration: 0.3,
        ease: "power1.out",
      }, "s")
      .to("#nav-line", {
        backgroundColor: "black",
        duration: 0.3,
        ease: "power1.out",
      }, "s")
      .to("#nav-btns svg", {
        stroke: "black",
        duration: 0.3,
        ease: "power1.out",
      }, "s");
  };

  const waitForLogoAssets = async () => {
    const logoImages = Array.from(document.querySelectorAll(".logo"));
    await Promise.all(
      logoImages
        .filter((img) => !img.complete)
        .map((img) => new Promise((res) => (img.onload = img.onerror = res)))
    );

    requestAnimationFrame(initLogoAnimation);
  };

  const timeout = setTimeout(waitForLogoAssets, 50);

  return () => {
    clearTimeout(timeout);
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.globalTimeline.clear();
  };
}, [router.asPath]);

  return (
    <>
      <div id="nav">
        <Link href="/" id="logo-container">
          <Image
            width={1000}
            height={1000}
            src="/logo/d.png"
            alt="D"
            class="logo"
          />
          <Image
            width={1000}
            height={1000}
            src="/logo/v.png"
            alt="V"
            class="logo"
          />
          <Image
            width={1000}
            height={1000}
            src="/logo/s.png"
            alt="S"
            class="logo"
          />
          <Image
            width={1000}
            height={1000}
            src="/logo/m.png"
            alt="M"
            class="logo"
          />
        </Link>
        <div className="nav-link">
          <Link href="/">
            shop
            <div className="hoverline"></div>
          </Link>
          <Link href="/lookbook">
            lookbook
            <div className="hoverline"></div>
          </Link>
          <Link href="/about">
            about
            <div className="hoverline"></div>
          </Link>
          <Link href="/contact">
            contact
            <div className="hoverline"></div>
          </Link>
        </div>
        <div id="nav-btns">
          <button onClick={openModal}>
            <svg
              class="icon-cart"
              width="15"
              height="18"
              viewBox="0 0 15 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              data-v-f756b3ad=""
            >
              <path
                d="M1.19891 5.8049C1.2448 5.02484 1.89076 4.41576 2.67216 4.41576H12.0298C12.8112 4.41576 13.4572 5.02485 13.5031 5.8049L14.0884 15.7547C14.1382 16.6023 13.4643 17.3171 12.6151 17.3171H2.08688C1.23775 17.3171 0.563767 16.6023 0.61363 15.7547L1.19891 5.8049Z"
                stroke-width="1.2"
              ></path>
              <path
                d="M11.4354 6.3737C11.4354 3.21604 9.60694 0.65625 7.35147 0.65625C5.096 0.65625 3.26758 3.21604 3.26758 6.3737"
                stroke-width="1.2"
                stroke-linecap="round"
              ></path>
            </svg>
          </button>
          <div id="nav-line"></div>
          <Link href="/profile">
            <svg
              class="icon-account"
              width="16"
              height="18"
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              data-v-f756b3ad=""
            >
              <path
                d="M15.024 17.0559V15.3068C15.024 14.379 14.6555 13.4892 13.9994 12.8332C13.3434 12.1772 12.4536 11.8086 11.5258 11.8086H4.52944C3.60166 11.8086 2.71188 12.1772 2.05585 12.8332C1.39981 13.4892 1.03125 14.379 1.03125 15.3068V17.0559"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M8.02798 8.30986C9.95997 8.30986 11.5262 6.74367 11.5262 4.81167C11.5262 2.87967 9.95997 1.31348 8.02798 1.31348C6.09598 1.31348 4.52979 2.87967 4.52979 4.81167C4.52979 6.74367 6.09598 8.30986 8.02798 8.30986Z"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </Link>
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

export default Navbar;
