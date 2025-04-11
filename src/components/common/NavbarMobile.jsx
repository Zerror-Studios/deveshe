import { IoMdMenu } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { useRouter } from "next/router";
import Modal from "./Modal";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const NavbarMobile = ({ openBag, setOpenBag , headerNav}) => {

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
  
    function openModal() {
      setModalIsOpen(true);
    }
  
    function closeModal() {
      setModalIsOpen(false);
      setOpenBag(false);
    }

    useGSAP(() => {
        const sideNavbar = document.getElementById('side-navbar')
        const closeMenuBtn = document.getElementById('closeMenu-btn')
        const menuBtn = document.getElementById('menu-btn')
        const sideMenuLinks = document.querySelectorAll('.side-menu-links a')
        const bag = document.querySelector('#bag')
        const logo = document.querySelector('.menulogo')

        menuBtn.addEventListener('click', () => {
            closeModal()
            gsap.to(sideNavbar,{
                left: 0,
                duration: 0.2,
                ease: 'power2.out'
            })
        })

        closeMenuBtn.addEventListener('click', () => {
            gsap.to(sideNavbar,{
                left: '100%',
                duration: 0.2,
                ease: 'power2.out'
            })
        })

        sideMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                gsap.to(sideNavbar,{
                    left: '100%',
                    duration: 0.2,
                    ease: 'power2.out'
                })
            })
        })
        bag.addEventListener('click', () => {
            gsap.to(sideNavbar,{
                delay: 1,
                left: '100%',
                duration: 0.2,
                ease: 'power2.out'
            })
        })
        logo.addEventListener('click', () => {
            gsap.to(sideNavbar,{
                left: '100%',
                duration: 0.2,
                ease: 'power2.out'
            })
        })

    }, [])

    return (
        <>
        <div className='navbar-mobile'>
            <Link href="/" id='nav-logo'>de ve she dreams</Link>
            <span id='menu-btn'>
                <IoMdMenu size={30} />
            </span>
            <div id='side-navbar'>
                <div className='side-menu-logo'>
                    <Link href="/" id='nav-logo' className="menulogo">de ve she dreams</Link>
                    <span id='closeMenu-btn'>
                        <IoMdClose size={30} />
                    </span>
                </div>
                <div className='side-menu-links'>
                    <Link href="/shop">shop</Link>
                    <Link href="/archives">archives</Link>
                    <Link href="/about">about</Link>
                    <Link href="/contact">contact</Link>
                    <Link id='about-link' href="/profile">account</Link>
                    <span id="bag" onClick={openModal}>bag</span>
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
    )
}

export default NavbarMobile