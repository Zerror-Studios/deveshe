import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { MenuData, SHOP_NAV_LINKS } from "@/helpers/MenuData";
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

const LogoGroup = () => (
  <Link href="/" id="logo-container">
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

const NAV_DROPDOWN_ZONE = ".nav-link, .nav-link-wrapper";

function closeMenuUnlessEnteringZone(e, setActiveMenu) {
  const related = e.relatedTarget;
  if (related?.closest?.(NAV_DROPDOWN_ZONE)) return;
  setActiveMenu(null);
}

const NavLinks = ({ pathname }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const { data: lookbookData } = useQuery(GET_LOOKBOOKS, {
    variables: {
      offset: 0,
      limit: 100,
      filter: { status: ProductStatus.PUBLISHED },
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const lookbookLinks = useMemo(() => {
    const fromApi =
      lookbookData?.getClientSideLookBooks?.lookBooks?.map((lb) => ({
        name: lb?.name || "Lookbook",
        link: `/lookbook/${lb?._id}`,
      })) || [];
    return [...fromApi];
  }, [lookbookData]);

  const getDropdownLinks = (menuItem) => {
    if (menuItem?.dropdownType === "lookbooks") return lookbookLinks;
    if (menuItem?.dropdownType === "categories") return SHOP_NAV_LINKS;
    return menuItem?.dropdownLinks || [];
  };

  const activeMenuHasDropdown =
    activeMenu !== null && getDropdownLinks(MenuData[activeMenu]).length > 0;

  const activeDropdownLinks =
    activeMenu !== null ? getDropdownLinks(MenuData[activeMenu]) : [];

  return (
    <>
      <div
        className={`nav-overlay ${activeMenuHasDropdown ? "nav-overlay--visible" : ""}`}
        onMouseEnter={() => setActiveMenu(null)}
      />

      <div
        className="nav-link"
        onMouseLeave={(e) => closeMenuUnlessEnteringZone(e, setActiveMenu)}
      >
        {MenuData.map((link, idx) => {
          const isPill = idx === 1;
          const hasDropdown =
            link?.dropdownType === "lookbooks" ||
            link?.dropdownType === "categories" ||
            getDropdownLinks(link).length > 0;
          const isActive = !hasDropdown && pathname === link.link;
          const isDropdownOpen = hasDropdown && activeMenu === idx;

          return (
            <div
              key={link?.name || idx}
              className={`nav-link-item${isDropdownOpen ? " nav-link-item--open" : ""}`}
              onMouseEnter={() => setActiveMenu(hasDropdown ? idx : null)}
            >
              {hasDropdown ? (
                <button
                  type="button"
                  className={`nav-link-trigger${isDropdownOpen ? " nav-link-trigger--open" : ""}`}
                >
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
            </div>
          );
        })}

        <div
          className={`nav-link-wrapper${activeMenuHasDropdown ? " nav-link-wrapper--open" : ""}`}
          onMouseLeave={(e) => closeMenuUnlessEnteringZone(e, setActiveMenu)}
        >
          {activeMenuHasDropdown ? (
            <div key={activeMenu} className="nav-link-wrapper__list">
              {activeDropdownLinks.map((item, linkIdx) => (
                <Link
                  key={`${item.link}-${item.name}`}
                  href={item.link}
                  style={{
                    "--nav-item-delay": `${0.12 + linkIdx * 0.05}s`,
                  }}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const NavButtons = ({ openCart, isLoggedIn }) => (
  <div id="nav-btns">
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

const initHomePage = (logos, xPositions, totalWidth, logoContainer) => {
  gsap.set("html,body", { overflow: "visible" });
  gsap.set(".logo", { position: "absolute" });
  gsap.set("#logo-container", { left: "2%" });
  gsap.set("#nav-btns", { right: "2%" });
  gsap.set(".nav-link", { opacity: 1 });
  gsap.set("#logo-container p, #nav-btns p", { opacity: 0 });
  gsap.set("#logo-container .logo, .nav_btn_items", { opacity: 1 });
  gsap.set(".logo", { top: (i) => i * 30, x: 0 });

  setNavWhite();
  logoContainer.style.width = `${xPositions[3] || totalWidth}px`;

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
      else if (isHome) initHomePage(logos, xPositions, totalWidth, logoContainer);
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
      <LogoGroup />
      <NavLinks pathname={pathname} />
      <NavButtons openCart={openCart} isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default Navbar;