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

  // useEffect(() => {
  //   const NavHoverLinks = document.querySelectorAll(".Nav-hover-link");
  //   const overlay = document.querySelector(".screen_overlay_SideNavbar");
  //   const SidebarDrawer = document.querySelector(".SideNavbar.SidebarClipPath");
  //   const Body = document.querySelector("body");
  //   const DataHoverLink = document.querySelectorAll(".dataHoverLink");
  //   const Images = document.querySelectorAll(".hover-image");

  //   let lastHoveredLink = null; // Track the last hovered link

  //   const handleMouseOver = (event) => {
  //     if (overlay) {
  //       gsap.to(
  //         overlay,
  //         {
  //           opacity: 1,
  //           visibility: "visible",
  //         },
  //         "a"
  //       );
  //       gsap.to(
  //         Body,
  //         {
  //           overflow: "hidden",
  //         },
  //         "a"
  //       );
  //     }

  //     if (SidebarDrawer) {
  //       gsap.to(
  //         SidebarDrawer,
  //         {
  //           clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  //           ease: "power1.inOut",
  //         },
  //         "a"
  //       );
  //     }

  //     // Show the data hover links
  //     DataHoverLink.forEach((link) => {
  //       link.style.opacity = 1;
  //       link.style.visibility = "visible";

  //       link.addEventListener("mouseenter", (event) => {
  //         const targetSelector = event.target.getAttribute("data-target");
  //         const targetElement = document.querySelector(targetSelector);

  //         if (targetElement) {
  //           targetElement.style.opacity = 1;
  //           targetElement.style.visibility = "visible";
  //         }
  //         // Show corresponding image
  //         const targetImage = document.querySelector(
  //           `.hover-image[data-target="${targetSelector}"]`
  //         );
  //         if (targetImage) {
  //           targetImage.style.opacity = 1;
  //           targetImage.style.visibility = "visible";
  //         }
  //         // Hide other elements
  //         DataHoverLink.forEach((otherLink) => {
  //           if (otherLink !== event.target) {
  //             const otherTargetSelector = otherLink.getAttribute("data-target");
  //             const otherTargetElement =
  //               document.querySelector(otherTargetSelector);
  //             if (otherTargetElement) {
  //               otherTargetElement.style.opacity = 0;
  //               otherTargetElement.style.visibility = "hidden";
  //             }
  //             // Hide corresponding image
  //             const otherTargetImage = document.querySelector(
  //               `.hover-image[data-target="${otherTargetSelector}"]`
  //             );
  //             if (otherTargetImage) {
  //               otherTargetImage.style.opacity = 0;
  //               otherTargetImage.style.visibility = "hidden";
  //             }
  //           }
  //         });
  //         lastHoveredLink = event.target;
  //       });
  //       link.addEventListener("click", () => {
  //         SidebarDrawer.style.clipPath = "polygon(0 0, 0% 0, 0% 100%, 0 100%)";
  //         overlay.style.opacity = "0";
  //         overlay.style.visibility = "hidden";
  //         Body.style.overflow = "auto";
  //       });
  //     });
  //   };

  //   const handleMouseLeave = () => {
  //     if (lastHoveredLink) {
  //       const targetSelector = lastHoveredLink.getAttribute("data-target");
  //       const targetElement = document.querySelector(targetSelector);

  //       if (targetElement) {
  //         targetElement.style.opacity = 1;
  //         targetElement.style.visibility = "visible";
  //       }
  //       // Show the last hovered image
  //       const lastHoveredImage = document.querySelector(
  //         `.hover-image[data-target="${targetSelector}"]`
  //       );
  //       if (lastHoveredImage) {
  //         lastHoveredImage.style.opacity = 1;
  //         lastHoveredImage.style.visibility = "visible";
  //       }
  //     } else {
  //       // Hide all data hover links if no link was previously hovered
  //       DataHoverLink.forEach((link) => {
  //         const targetSelector = link.getAttribute("data-target");
  //         const targetElement = document.querySelector(targetSelector);

  //         if (targetElement) {
  //           targetElement.style.opacity = 0;
  //           targetElement.style.visibility = "hidden";
  //         }
  //         const targetImage = document.querySelector(
  //           `.hover-image[data-target="${targetSelector}"]`
  //         );
  //         if (targetImage) {
  //           targetImage.style.opacity = 0;
  //           targetImage.style.visibility = "hidden";
  //         }
  //       });
  //     }

  //     // Reset sidebar and overlay on mouse leave
  //     SidebarDrawer.style.clipPath = "polygon(0 0, 0% 0, 0% 100%, 0 100%)";
  //     overlay.style.opacity = "0";
  //     overlay.style.visibility = "hidden";
  //     Body.style.overflow = "auto";
  //   };

  //   // Add event listeners
  //   NavHoverLinks.forEach((link) => {
  //     link.addEventListener("mouseover", handleMouseOver);
  //   });

  //   SidebarDrawer.addEventListener("mouseleave", handleMouseLeave);

  //   // Clean up the event listeners when the component unmounts
  //   return () => {
  //     NavHoverLinks.forEach((link) => {
  //       link.removeEventListener("mouseover", handleMouseOver);
  //     });
  //     SidebarDrawer.removeEventListener("mouseleave", handleMouseLeave);
  //   };
  // }, [update]);

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
                <Link href="/shop">shop</Link>
                <Link href="/archives">archives</Link>
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
