"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import MobileNavMenu from "@/components/common/MobileNavMenu";
import { GET_NAV_LOOKBOOKS } from "@/graphql";
import { MenuData, SHOP_NAV_LINKS } from "@/helpers/MenuData";

const NAV_LOOKBOOK_LIMIT = 50;

const NavbarMobile = ({ openCart }) => {
  const { isLoggedIn } = useAuthStore((state) => state);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const menuBtnRef = useRef(null);
  const router = useRouter();

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
          href: `/lookbook/${lb.slug}`,
        })) || [];
    return [...fromApi];
  }, [lookbookData]);

  const shopCategoryLinks = useMemo(
    () => SHOP_NAV_LINKS.map(({ name, link }) => ({ name, href: link })),
    []
  );

  const exploreLinks = useMemo(() => {
    const explore = MenuData.find((item) => item.name === "Explore");
    const links =
      explore?.dropdownLinks?.map((item) => ({
        name: item.name,
        href: item.link,
      })) ?? [];
    // PRD-014 FR-2.8 (UX-28): site search
    return [...links, { name: "Search", href: "/search" }];
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setExpandedId(null);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      if (prev) setExpandedId(null);
      return !prev;
    });
  };

  useEffect(() => {
    const line1 = menuBtnRef.current?.querySelector(".line1m");
    const line2 = menuBtnRef.current?.querySelector(".line2m");
    if (!line1 || !line2) return;

    if (isMenuOpen) {
      gsap
        .timeline()
        .to([line1, line2], {
          top: "50%",
          yPercent: -50,
          duration: 0.2,
        })
        .to(line1, { rotate: 45, duration: 0.2 }, "-=0.1")
        .to(line2, { rotate: -45, duration: 0.2 }, "<");
    } else {
      gsap
        .timeline()
        .to([line1, line2], { rotate: 0, duration: 0.2 })
        .to(line1, { top: 0, yPercent: 0, duration: 0.2 })
        .to(line2, { top: "100%", yPercent: 0, duration: 0.2 }, "<");
    }
  }, [isMenuOpen]);

  const handleLoginBtn = () => {
    router.push("/login");
    closeMenu();
  };

  return (
    <>
      <div className="navbar-mobile">
        <div className="navbar-mobile-wrap">
          <Link href="/" id="nav-logo" aria-label="DeVeSheDreams home">
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/d.webp"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/v.webp"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/s.webp"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/m.webp"
              alt=""
            />
          </Link>
          <div className="menu-icons">
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              aria-label={isLoggedIn ? "My account" : "Log in"}
            >
              <Image
                className="account-logo"
                width={23}
                height={23}
                src="/placeholder/user.png"
                alt=""
              />
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label="Open bag"
              style={{ background: "none", border: 0, padding: 0, lineHeight: 0 }}
            >
              <HiOutlineShoppingBag
                className="bag-icon"
                size={23}
                aria-hidden="true"
              />
            </button>
            <div
              id="menu-btn"
              ref={menuBtnRef}
              onClick={toggleMenu}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMenu();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <span className="line1m linem"></span>
              <span className="line2m linem"></span>
            </div>
          </div>
        </div>
      </div>

      <MobileNavMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        expandedId={expandedId}
        onToggleSection={(id) =>
          setExpandedId((prev) => (prev === id ? null : id))
        }
        isLoggedIn={isLoggedIn}
        onLogin={handleLoginBtn}
        shopLinks={shopCategoryLinks}
        lookbookLinks={lookbookLinks}
        exploreLinks={exploreLinks}
      />
    </>
  );
};

export default NavbarMobile;
