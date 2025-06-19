import Link from "next/link";
import React, { useEffect, useState } from "react";
import LinksDot from "../LinksDot";
import { IoSearch } from "react-icons/io5";
import { FaEuroSign } from "react-icons/fa";
import { useGSAP } from "@gsap/react";
import { useDispatch, useSelector } from "react-redux";
import { FaRegUser } from "react-icons/fa";
import gsap from "gsap";
import { useRouter } from "next/router";
import { fetchuser } from "../../features/user/UserSlice";
import { getMenu, getSubMenu } from "../../../api_fetch/admin/Menu";
import Modal from "./Modal";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
const Navbar = ({ openBag, setOpenBag , headerNav}) => {
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
    } 
    else if(router.pathname === "/archives"){
      setColor("#000");
    }
    else if(router.pathname === "/contact"){
      setColor("#000");
    }
    else if (router.pathname === "/collections") {
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
        <div ref={headerNav} className='header-links'>
                <div className="link-wp">
                <Link href="/">shop</Link>
                <Link href="/lookbook">lookbook</Link>
                <Link href="/about">about</Link>
                <Link href="/contact">contact</Link>
                </div>
                <div className="link-wp">
                <Link id='about-link' href="/profile">account</Link>
                <span onClick={openModal}>bag</span>
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
