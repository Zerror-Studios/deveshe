import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { MenuData } from "@/helpers/MenuData";
import { GET_LOOKBOOKS } from "@/graphql";
import { ProductStatus } from "@/utils/Constant";

gsap.registerPlugin(ScrollTrigger);

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGO_SRCS = [
  { src: "/assets/images/logo/d.webp", alt: "D" },
  { src: "/assets/images/logo/v.webp", alt: "V" },
  { src: "/assets/images/logo/s.webp", alt: "S" },
  { src: "/assets/images/logo/m.webp", alt: "M" },
];

const PILL_PATH =
  "M10.21 4V0a4.09 4.09 0 0 1-4 4H4a4.09 4.09 0 0 1-4-4v24a4.09 4.09 0 0 1 4-4h2.21a4.09 4.09 0 0 1 4 4V4Z";

// ─── Sub-components ───────────────────────────────────────────────────────────

const PillSvg = ({ className }) => (
  <svg
    viewBox="0 0 10.21 24"
    className={`menu_pill_svg ${className}`}
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d={PILL_PATH} />
  </svg>
);

const NavLoader = ({ percent }) => (
  <div id="loader_slider">
    <span id="loader_looking">looking for</span>
    <span id="loader_emotions">new emotions?</span>
    <p id="loader_percent">
      loading... <span>{percent}%</span>
    </p>
  </div>
);

const LogoGroup = () => (
  <Link href="/" id="logo-container">
    <p>new emotions?</p>
    {LOGO_SRCS.map(({ src, alt }) => (
      <Image
        key={alt}
        width={1000}
        height={1000}
        src={src}
        alt={alt}
        className="logo"
      />
    ))}
  </Link>
);

const NavLinks = ({ pathname }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const { data: lookbookData } = useQuery(GET_LOOKBOOKS, {
    variables: {
      offset: 0,
      limit: 20,
      filter: { status: ProductStatus.PUBLISHED },
    },
    fetchPolicy: "cache-first",
  });

  const lookbookLinks =
    lookbookData?.getClientSideLookBooks?.lookBooks?.map((lb) => ({
      name: lb?.name || "Lookbook",
      link: `/lookbook/${lb?._id}`,
    })) || [];

  const getDropdownLinks = (menuItem) => {
    if (menuItem?.dropdownType === "lookbooks") return lookbookLinks;
    return menuItem?.dropdownLinks || [];
  };

  const activeMenuHasDropdown =
    activeMenu !== null && getDropdownLinks(MenuData[activeMenu]).length > 0;

  return (
    <>
      <div
        className={`nav-overlay ${activeMenuHasDropdown ? "nav-overlay--visible" : ""}`}
        onMouseEnter={() => setActiveMenu(null)}
      />

      <div
        className="nav-link"
        onMouseLeave={() => setActiveMenu(null)}
      >
        {MenuData.map((link, idx) => {
          const isPill = idx === 1;
          const dropdownLinks = getDropdownLinks(link);
          const hasDropdown = dropdownLinks.length > 0;
          const isActive = !hasDropdown && pathname === link.link;
          return (
            <div
              key={link?.name || idx}
              className="nav-link-item"
              onMouseEnter={() => setActiveMenu(hasDropdown ? idx : null)}
            >
              {hasDropdown ? (
                <button type="button" className="nav-link-trigger">
                  {isPill && <PillSvg className="menu_pill_svg--left" />}
                  <span className={isPill ? "menu_pill_text" : undefined}>
                    {link.name}
                  </span>
                  {isPill && <PillSvg className="menu_pill_svg--right" />}
                  <div className="hoverline" />
                </button>
              ) : (
                <Link href={link.link} className={isActive ? "active" : ""}>
                  {isPill && <PillSvg className="menu_pill_svg--left" />}
                  <span className={isPill ? "menu_pill_text" : undefined}>
                    {link.name}
                  </span>
                  {isPill && <PillSvg className="menu_pill_svg--right" />}
                  <div className="hoverline" />
                </Link>
              )}

              {dropdownLinks.length > 0 && (
                <div
                  className={`nav-link-wrapper ${activeMenu === idx ? "nav-link-wrapper--open" : ""}`}
                >
                  {dropdownLinks.map((item) => (
                    <Link key={`${item.link}-${item.name}`} href={item.link}>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

const NavButtons = ({ openCart, isLoggedIn }) => (
  <div id="nav-btns">
    <p>looking for</p>
    <button className="nav_btn_items" onClick={openCart}>
      BAG
      <svg
        viewBox="0 0 10.21 24"
        className="menu_pill_svg menu_pill_btn_svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={PILL_PATH} />
      </svg>
    </button>
    <Link className="nav_btn_items" href={isLoggedIn ? "/profile" : "/login"}>
      {isLoggedIn ? "ACCOUNT" : "LOG IN"}
    </Link>
  </div>
);

// ─── GSAP Helpers ─────────────────────────────────────────────────────────────

const waitForImages = (imgs) =>
  Promise.all(
    Array.from(imgs).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => { img.onload = img.onerror = res; })
    )
  );

const calcXPositions = (logos, spacing = 10) => {
  const xPositions = [];
  let x = 0;
  logos.forEach((logo) => {
    xPositions.push(x);
    x += logo.getBoundingClientRect().width + spacing;
  });
  return { xPositions, totalWidth: x };
};

const setNavTransparent = () =>
  gsap.set("#nav", {
    backgroundColor: "rgba(255,255,255,0)",
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
  });

const setNavWhite = () => {
  gsap.set("#logo-container img", { filter: "invert(1)" });
  gsap.set(".nav-link a", { color: "#fff" });
  gsap.set("#nav-btns svg:not(.menu_pill_btn_svg)", { stroke: "#fff" });
  gsap.set("#nav-line", { backgroundColor: "#fff" });
  gsap.set(".hoverline", { backgroundColor: "#fff" });
  setNavTransparent();
};

const setNavBlack = () => {
  gsap.set("#logo-container img", { filter: "invert(0)" });
  gsap.set(".nav-link a", { color: "#000" });
  gsap.set("#nav-btns svg:not(.menu_pill_btn_svg)", { stroke: "#000" });
  gsap.set("#nav-line", { backgroundColor: "#000" });
  gsap.set(".hoverline", { backgroundColor: "#000" });
  setNavTransparent();
};

const setStaticLayout = () => {
  gsap.set("html,body", { overflow: "visible" });
  gsap.set(".logo", { position: "static", transform: "translate(0,0)" });
  gsap.set("#logo-container", { gap: "13px", left: "2%" });
  gsap.set("#nav-btns", { right: "2%" });
  gsap.set("#loader_slider", { opacity: 0, display: "none" });
  gsap.set(".nav-link", { opacity: 1 });
  gsap.set("#logo-container p, #nav-btns p", { opacity: 0 });
  gsap.set("#logo-container .logo, .nav_btn_items", { opacity: 1 });
};

const addLogoScrollTrigger = (start, end) => {
  gsap.timeline({
    scrollTrigger: {
      trigger: document.documentElement,
      start,
      end,
      scrub: 1,
    },
  }).to("#logo-container img, .logo", {
    filter: "invert(0)",
    ease: "power1.out",
    duration: 0.3,
  });
};

// ─── Page Init Functions ──────────────────────────────────────────────────────

const initShopPage = () => {
  setStaticLayout();
  setNavWhite();
  addLogoScrollTrigger("100vh top", "calc(100vh + 80px) top");
};

const initOtherPage = () => {
  setStaticLayout();
  setNavBlack();
};

const initHomePage = (logos, xPositions, totalWidth, logoContainer, setPercent) => {
  logos.forEach((logo, i) => gsap.set(logo, { x: xPositions[i], top: 0 }));

  gsap.set("html,body", { overflow: "hidden" });
  gsap.set(".logo", { position: "absolute" });
  gsap.set("#logo-container", { left: "79%" });
  gsap.set("#nav-btns", { right: "92%" });
  gsap.set("#loader_slider", { opacity: 1, display: "block" });
  gsap.set(".nav-link", { opacity: 0 });
  gsap.set("#logo-container p, #nav-btns p", { opacity: 1 });
  gsap.set("#logo-container .logo, .nav_btn_items", { opacity: 0 });

  gsap.set("#loader_looking", { opacity: 1, x: 0, y: 0 });
  gsap.set("#loader_emotions", { opacity: 1, x: 0, y: 0 });
  gsap.set("#loader_percent", { opacity: 1, y: 0 });

  setNavWhite();
  logoContainer.style.width = `${xPositions[3] || totalWidth}px`;

  const startLoader = () => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setPercent(count);
      if (count >= 100) clearInterval(interval);
    }, 10);
  };

  gsap
    .timeline()
    .call(startLoader)
    .to("#loader_percent", {
      y: "120%",
      duration: 0.8,
      delay: 0.8,
      ease: "power2.in",
    })
    .to("#loader_looking", { x: "110vw", duration: 0.7, ease: "power2.in" }, "exit")
    .to("#loader_emotions", { x: "-110vw", duration: 0.7, ease: "power2.in" }, "exit")
    .to("#logo-container", { left: "2%", duration: 0.5, ease: "power2.in" }, "move")
    .to("#nav-btns", { right: "2%", duration: 0.5, ease: "power2.in" }, "move")
    .to("#logo-container p, #nav-btns p", { opacity: 0, duration: 0.2, ease: "power3.in" }, "move")
    .to("#logo-container .logo, .nav_btn_items", { opacity: 1, duration: 0.2, ease: "power3.in" }, "move")
    .to(".nav-link", { opacity: 1, duration: 0.3, ease: "power2.in" })
    .to(".logo", { top: (i) => i * 30, x: 0, duration: 0.8, ease: "power2.inOut", stagger: 0.1 })
    .to(
      "#loader_slider",
      {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        onComplete: () => {
          setTimeout(() => {
            gsap.set("#loader_slider", { display: "none" });
            gsap.set("html,body", { overflow: "visible" });
          }, 1600);
        },
      },
      "-=1.6"
    );

  gsap
    .timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "400px 20%",
        scrub: 1,
      },
    })
    .to(".logo", { top: 0, x: (i) => xPositions[i], ease: "sine.out", duration: 0.3 }, "collapse")
    .to("#logo-container", { width: `${totalWidth}px`, ease: "sine.out" }, "collapse")
    .to(".logo", { filter: "invert(0)", ease: "power1.out", duration: 0.3 }, "collapse");
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Navbar = ({ openCart }) => {
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore((state) => state);
  const [percent, setPercent] = useState(0);
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash);
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1000) return;

    const init = async () => {
      const logos = document.querySelectorAll(".logo");
      const logoContainer = document.querySelector("#logo-container");
      const nav = document.querySelector("#nav");
      if (!logos.length || !logoContainer || !nav) return;

      await waitForImages(logos);
      const { xPositions, totalWidth } = calcXPositions(logos);

      const isHome = pathname === "/" && window.location.hash !== "#shop";
      const isShop = pathname === "/shop";

      if (isShop) initShopPage();
      else if (isHome) initHomePage(logos, xPositions, totalWidth, logoContainer, setPercent);
      else initOtherPage();
    };

    const timeout = setTimeout(() => requestAnimationFrame(init), 30);
    return () => {
      clearTimeout(timeout);
      ScrollTrigger.killAll();
      gsap.globalTimeline.clear();
    };
  }, [pathname, hash]);

  return (
    <div id="nav">
      {pathname === "/" && <NavLoader percent={percent} />}
      <LogoGroup />
      <NavLinks pathname={pathname} />
      <NavButtons openCart={openCart} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Navbar;