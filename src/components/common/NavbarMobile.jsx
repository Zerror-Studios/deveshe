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
import { GET_LOOKBOOKS } from "@/graphql";
import { MenuData, SHOP_NAV_LINKS } from "@/helpers/MenuData";
import { ProductStatus } from "@/utils/Constant";

const NavbarMobile = ({ openCart }) => {
  const { isLoggedIn } = useAuthStore((state) => state);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const menuBtnRef = useRef(null);
  const router = useRouter();

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
        href: `/lookbook/${lb?._id}`,
      })) || [];
    return [...fromApi];
  }, [lookbookData]);

  const shopCategoryLinks = useMemo(
    () => SHOP_NAV_LINKS.map(({ name, link }) => ({ name, href: link })),
    []
  );

  const exploreLinks = useMemo(() => {
    const explore = MenuData.find((item) => item.name === "Explore");
    return (
      explore?.dropdownLinks?.map((item) => ({
        name: item.name,
        href: item.link,
      })) ?? []
    );
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
          <Link href="/" id="nav-logo">
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/d.webp"
              alt="D"
            />
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/v.webp"
              alt="V"
            />
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/s.webp"
              alt="S"
            />
            <Image
              width={1000}
              height={1000}
              src="/assets/images/logo/m.webp"
              alt="M"
            />
          </Link>
          <div className="menu-icons">
            <Link href={isLoggedIn ? "/profile" : "/login"}>
              <Image
                className="account-logo"
                width={23}
                height={23}
                src="/placeholder/user.png"
                alt="account"
              />
            </Link>
            <HiOutlineShoppingBag
              onClick={openCart}
              className="bag-icon"
              size={23}
            />
            <div
              id="menu-btn"
              ref={menuBtnRef}
              onClick={toggleMenu}
              role="button"
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
