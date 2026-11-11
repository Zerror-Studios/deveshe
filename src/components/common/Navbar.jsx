import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { MenuData, SHOP_NAV_LINKS } from "@/helpers/MenuData";
import { GET_NAV_LOOKBOOKS } from "@/graphql";

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

const NAV_LOOKBOOK_LIMIT = 50;

const LogoGroup = () => (
  <Link href="/" id="logo-container" aria-label="DeVeSheDreams home">
    {LOGO_SRCS.map(({ src, alt }) => (
      <Image
        key={alt}
        width={1000}
        height={1000}
        src={src}
        alt=""
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

  // Published lookbooks from the catalog (PRD-027), linked by slug
  const { data: lookbookData } = useQuery(GET_NAV_LOOKBOOKS, {
    variables: { limit: NAV_LOOKBOOK_LIMIT },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const lookbookLinks = useMemo(() => {
    const fromApi =
      lookbookData?.getClientSideLookbooks?.lookbooks
        ?.filter((lb) => lb?.slug)
        .map((lb) => ({
          name: lb.title || "Lookbook",
          link: `/lookbook/${lb.slug}`,
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
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  onFocus={() => setActiveMenu(idx)}
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
    {/* PRD-014 FR-2.8 (UX-28): site search */}
    <Link className="nav_btn_items" href="/search" aria-label="Search">
      SEARCH
    </Link>
    <button
      type="button"
      className="nav_btn_items"
      onClick={openCart}
      aria-label="Open bag"
    >
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

// Sets only the targets that exist: the nav markup changes by breakpoint and
// page, and GSAP warns about every selector that matches nothing.
const setIfPresent = (selector, vars) => {
  if (document.querySelector(selector)) gsap.set(selector, vars);
};

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
  setIfPresent("#nav", {
    backgroundColor: "rgba(255,255,255,0)",
    // GSAP adds the -webkit- prefix itself where Safari needs it
    backdropFilter: "blur(0px)",
  });

const setNavWhite = () => {
  setIfPresent("#logo-container img", { filter: "invert(1)" });
  setIfPresent(".nav-link a", { color: "#fff" });
  setIfPresent("#nav-btns svg:not(.menu_pill_btn_svg)", { stroke: "#fff" });
  setIfPresent("#nav-line", { backgroundColor: "#fff" });
  setIfPresent(".hoverline", { backgroundColor: "#fff" });
  setNavTransparent();
};

const setNavBlack = () => {
  setIfPresent("#logo-container img", { filter: "invert(0)" });
  setIfPresent(".nav-link a", { color: "#000" });
  setIfPresent("#nav-btns svg:not(.menu_pill_btn_svg)", { stroke: "#000" });
  setIfPresent("#nav-line", { backgroundColor: "#000" });
  setIfPresent(".hoverline", { backgroundColor: "#000" });
  setNavTransparent();
};

const setStaticLayout = () => {
  setIfPresent("html,body", { overflow: "visible" });
  setIfPresent(".logo", { position: "static", transform: "translate(0,0)" });
  setIfPresent("#logo-container", { gap: "13px", left: "2%" });
  setIfPresent("#nav-btns", { right: "2%" });
  setIfPresent(".nav-link", { opacity: 1 });
  setIfPresent("#logo-container p, #nav-btns p", { opacity: 0 });
  setIfPresent("#logo-container .logo, .nav_btn_items", { opacity: 1 });
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
  setIfPresent("html,body", { overflow: "visible" });
  setIfPresent(".logo", { position: "absolute" });
  setIfPresent("#logo-container", { left: "2%" });
  setIfPresent("#nav-btns", { right: "2%" });
  setIfPresent(".nav-link", { opacity: 1 });
  setIfPresent("#logo-container p, #nav-btns p", { opacity: 0 });
  setIfPresent("#logo-container .logo, .nav_btn_items", { opacity: 1 });
  setIfPresent(".logo", { top: (i) => i * 30, x: 0 });

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

    // Only this component's tweens and triggers are killed on cleanup: a
    // global ScrollTrigger.killAll() would also kill the page's own (SF-20).
    const ctx = gsap.context(() => {});
    let isCancelled = false;
    let frame = null;

    const init = async () => {
      const logos = document.querySelectorAll(".logo");
      const logoContainer = document.querySelector("#logo-container");
      const nav = document.querySelector("#nav");
      if (!logos.length || !logoContainer || !nav) return;

      await waitForImages(logos);
      if (isCancelled) return;
      const { xPositions, totalWidth } = calcXPositions(logos);

      const isHome = pathname === "/" && window.location.hash !== "#shop";
      const isShop = pathname === "/shop";

      // Recorded in the context (synchronous), so the cleanup can kill it
      ctx.add(() => {
        if (isShop) initShopPage();
        else if (isHome) {
          initHomePage(logos, xPositions, totalWidth, logoContainer);
        } else initOtherPage();
      });
    };

    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(init);
    }, 30);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
      ctx.kill();
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