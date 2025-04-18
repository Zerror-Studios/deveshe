import React from 'react'
import styles from './shop.module.css'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
const Section8 = () => {

    useGSAP(() => {
        function splitText(element) {
         document.querySelectorAll(element).forEach((h) => {
             let clutter = "";
             h.textContent.split("").forEach((letter) => {
               if (letter === " ") {
                 clutter += `<span>&nbsp;</span>`; // preserve space
               } else {
                 clutter += `<span>${letter}</span>`;
               }
             });
             h.innerHTML = clutter;
         });
        }
         splitText('#title-main-wrap8 h2')
         const tl2 = gsap.timeline({
             scrollTrigger: {
               trigger: "#title-main-wrap8",
               scroller: "body",
               start: "top 100%",
               end: "top 80%",
               // scrub: true,
            //    markers: true
             }
           })
           tl2.fromTo('#title-main-wrap8 span',  {
             transform: "rotateX(90deg)",
         }, {
             duration: .8,
             transform: "rotateX(0deg)",
             stagger: 0.05,
             // ease: "power2.out",
             ease: "bounce.out",
         })
 
         setTimeout(() => {
             ScrollTrigger.refresh();
         }, 50)
     }, [])

    return (
        <div className={styles.shopSection8}>
            <div id='title-main-wrap8'>
                <h2>Your interests and values are</h2>
                <h2>your guiding stars to happiness</h2>
                <h2>and success.</h2>
            </div>
            <div className={styles.secPara7}>
                <h6>With years of experience</h6>
                <p>providing online education, I've learned
                    that the key to supporting you is <span>helping you uncover</span> your strengths and passions.
                </p>
            </div>
            <div className={styles.strip8}>
                <Image width={1000} height={1000} src="/about/dress5.jpg" alt='image' />
                <Image width={1000} height={1000} src="/about/dress6.jpeg" alt='image' />
                <Image width={1000} height={1000} src="/about/dress7.jpeg" alt='image' />
                <Image width={1000} height={1000} src="/about/dress8.jpg" alt='image' />
            </div>
        </div>
    )
}

export default Section8