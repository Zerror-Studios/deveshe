import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { useRouter } from "next/router";
import { fetchuser } from "../../features/user/UserSlice";
import { getMenu } from "../../../api_fetch/admin/Menu";
import Modal from "./Modal";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Navbar = ({ openBag, setOpenBag }) => {
  const [menu, setMenu] = useState([]);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = router.pathname;
  const pathName = router.pathname.split("/")[1];
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [color, setColor] = useState(null);
  const [update, setUpdate] = useState(false);
  const user = useSelector((state) => state.user.user);
  const cartCount = useSelector((state) => state.cart.itemcount);
  useEffect(() => {
    dispatch(fetchuser());
  }, []);

  const verifyUser = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/profile");
    }
  };

  const fetchData = async () => {
    try {
      const res = await getMenu({ limit: 20, offset: 0 });
      if (res) {
        setMenu(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const go = (cat, subcat) => {
    router.push(`/collections/${cat}&${subcat}`);
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (window.innerWidth >= 1000) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".header_cntr",
          start: "10% 0%",
          end: "bottom 0%",
          scrub: 0.5,
          markers: false,
        },
      });
      tl.to(
        ".header_cntr",
        {
          height: "38px",
          // transition: "height 0.4s, color 0.2s 0.4s",
          // color: "#000",
          // backgroundColor: "green",
          duration: 1,
        },
        "a"
      );
      tl.to(
        ".header_inner",
        {
          height: "22px",
          // transition: "height 0.4s",
          // backgroundColor: "red",
          duration: 1,
        },
        "a"
      );
      tl.to(
        ".header_logo_svg",
        {
          height: "22px",
          // transition: "all .1s ",
          duration: 1,
        },
        "a"
      );
      tl.to(
        ".header_nav_links_wrap",
        {
          opacity: 0,
          duration: 1,
          // transition: "oapcity 0.4s, hidden 0.4s, height 0.4s",
        },
        "a"
      );
      tl.to(
        ".header_nav_links_left_inner",
        {
          opacity: 0,
          duration: 1,
          transition: "opacity 0.1s, hidden 0.1s, height 0.4s",

          // transition: "oapcity 0.4s, hidden 0.4s, height 0.4s",
        },
        "a"
      );
      tl.to(
        ".header_nav_links_left",
        {
          color: "#000",
          duration: 1,
          transition: "color 0.1s 0s",
          // transition: "oapcity 0.4s, hidden 0.4s, height 0.4s",
        },
        "b"
      );
      tl.to(
        ".header_logo_svg",
        {
          color: "#000",
          duration: 1,
          transition: "color 0.1s 0s",
        },
        "b"
      );
      tl.to(
        ".headerconatin",
        {
          backgroundColor: "#ffff",
          duration: 0.5,
          ease: "power1.inOut",
          transition: "Background-color 0.2s 0s",
        },
        "b"
      );
      tl.to(
        ".header_lineargradient",
        {
          display: "none",
        },
        "b"
      );

      gsap.to(".Shop_shopAll_text_onScroll", {
        scrollTrigger: {
          trigger: ".header_cntr",
          start: "bottom 0%",
          end: "bottom 10%",
          scrub: 0.5,
        },
        opacity: 1,
        visibility: "visible",
        // display: "none",
      });
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, []);
  useEffect(() => {
    if (router.pathname === "/collections/shop-all") {
      setColor("#000");
    } else if (router.pathname === "/") {
      setColor("#ffff");
    } else if (router.pathname === "/archives") {
      setColor("#000");
    } else if (router.pathname === "/contact") {
      setColor("#000");
    } else if (router.pathname === "/collections") {
      setColor("#ffff");
    }
  }, [router.pathname, color]);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
    setOpenBag(false);
  }

  return (
    <>
      <div id="nav">
        <Link href="/" id="logo-nav">
          de ve she dreams
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
