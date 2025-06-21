import { LuMenu } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { useRouter } from "next/router";
import Modal from "./Modal";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { VscAccount } from "react-icons/vsc";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Image from "next/image";
import { ModalContext } from "../context/ModalProvider";
gsap.registerPlugin(ScrollTrigger);

const NavbarMobile = ({ openBag, setOpenBag, headerNav }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const path = router.pathname;
    const pathName = router.pathname.split("/")[1];
    const [modalIsOpen, setModalIsOpen] = useContext(ModalContext);
    const user = useSelector((state) => state.user.user);
    const cartCount = useSelector((state) => state.cart.itemcount);
    const menuTL = useRef(null);

    const openModal = () => setModalIsOpen(true);

    const closeModal = () => {
        setModalIsOpen(false);
        setOpenBag(false);
    };

    useGSAP(() => {
        menuTL.current = gsap.timeline({ paused: true })
            .to(".line1m", {
                top: "50%",
                transform: "translateY(-50%)",
                duration: 0.2
            }, "a")
            .to(".line2m", {
                top: "50%",
                transform: "translateY(-50%)",
                duration: 0.2
            }, "a")
            .to(".line1m", {
                rotate: 45,
                duration: 0.2
            }, "b")
            .to(".line2m", {
                rotate: -45,
                duration: 0.2
            }, "b")
            .to("#side-navbar", {
                clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 0.3,
                ease: "power2.out",
            }, "a")
            .to(".side-menu-links",{
                y:50,
                duration:0.3
            },"a")

            document.querySelectorAll(".side-menu-links a").forEach((link) => {
                link.addEventListener("click", () => {
                    setIsMenuOpen(false);
                    menuTL.current.reverse();
                });
            })
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(prev => {
            const newState = !prev;
            if (newState) {
                menuTL.current.play();
            } else {
                menuTL.current.reverse();
            }
            return newState;
        });
    };
    
    

    return (
        <>
            <div className='navbar-mobile'>
                <Link href="/" id='nav-logo'>
                <Image width={1000} height={1000} src="/logo/logo-m.png" />
                </Link>
                <div className="menu-icons">
                    <Link href="/profile">
                    <Image width={23} height={23} src="/images/user.png" />
                    </Link>
                    <HiOutlineShoppingBag onClick={openModal} size={23} />
                    <div id='menu-btn' onClick={toggleMenu}>
                        <span className="line1m linem"></span>
                        <span className="line2m linem"></span>
                    </div>
                </div>
                <div id='side-navbar'>
                    <div className='side-menu-links'>
                        <Link href="/">shop</Link>
                        <Link href="/lookbook">lookbook</Link>
                        <Link href="/about">about</Link>
                        <Link href="/contact">contact</Link>
                    </div>
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

export default NavbarMobile;
