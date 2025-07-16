import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const router = useRouter();
  useEffect(() => {
    if (window.innerWidth < 576) return;

    const init = async () => {
      const logos = document.querySelectorAll(".logo");
      const logoContainer = document.querySelector("#logo-container");
      const nav = document.querySelector("#nav");

      if (!logos.length || !logoContainer || !nav) return;

      // Wait for all logos to load
      await Promise.all(
        Array.from(logos).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = img.onerror = res;
              })
        )
      );

      // Calculate positions
      const spacing = 10;
      const xPositions = [];
      let currentX = 0;

      logos.forEach((logo) => {
        const width = logo.getBoundingClientRect().width;
        xPositions.push(currentX);
        currentX += width + spacing;
      });

      if (router.pathname !== "/") {
        gsap.set("#logo-container img", { filter: "invert(0)" });
        gsap.set(".nav-link a", { color: "#000" });
        gsap.set("#nav", { backgroundColor: "#fff" });
        gsap.set("#nav-btns svg", { stroke: "#000" });
        gsap.set("#nav-line", { backgroundColor: "#000" });
        gsap.set(".logo", { position: "static" });
        gsap.set("#logo-container", { gap: "13px" });
        gsap.set(".hoverline", { backgroundColor: "#000" });
        return;
      }

      gsap.set("#logo-container img", { filter: "invert(1)" });
      gsap.set(".nav-link a", { color: "#fff" });
      gsap.set("#nav", { backgroundColor: "transparent" });
      gsap.set("#nav-btns svg", { stroke: "#fff" });
      gsap.set("#nav-line", { backgroundColor: "#fff" });
      gsap.set(".logo", { position: "absolute" });
      gsap.set(".hoverline", { backgroundColor: "#fff" });

      const finalWidth = currentX;
      logoContainer.style.width = `${xPositions[3] || finalWidth}px`;

      // GSAP Timeline
      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "400px 20%",
            scrub: 1,
            // markers: true,
          },
        })
        .to(
          ".logo",
          {
            top: 0,
            x: (i) => xPositions[i],
            ease: "sine.out",
            duration: 0.3,
          },
          "start"
        )
        .to(
          "#logo-container",
          {
            width: `${finalWidth}px`,
            ease: "sine.out",
          },
          "start"
        )
        .to(
          "#nav",
          {
            backgroundColor: "#fff",
            ease: "power1.out",
            duration: 0.3,
          },
          "s"
        )
        .to(
          ".hoverline",
          {
            backgroundColor: "#000",
            ease: "power1.out",
            duration: 0.3,
          },
          "s"
        )
        .to(
          ".logo",
          {
            filter: "invert(0)",
            ease: "power1.out",
            duration: 0.3,
          },
          "s"
        )
        .to(
          ".nav-link a",
          {
            color: "black",
            ease: "power1.out",
            duration: 0.3,
          },
          "s"
        )
        .to(
          "#nav-line",
          {
            backgroundColor: "black",
            ease: "power1.out",
            duration: 0.3,
          },
          "s"
        )
        .to(
          "#nav-btns svg",
          {
            stroke: "black",
            ease: "power1.out",
            duration: 0.3,
          },
          "s"
        );
    };

    const timeout = setTimeout(() => requestAnimationFrame(init), 30);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.killAll();
      gsap.globalTimeline.clear();
    };
  }, [router.asPath]);

  return (
    <>
      <div id="nav" className="nav1">
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
          <button>
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
    </>
  );
};

export default Navbar;
