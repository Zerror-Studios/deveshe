import React from 'react'
import styles from "../shop/shop.module.css"
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
const Section5 = () => {

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
        splitText('#title-main-wrap5 h2')
        splitText('#title-main-wrap51')

        const tl = gsap.timeline()
        tl.fromTo('#title-main-wrap5 h2 span', {
            transform: "rotateX(90deg)",
        }, {
            duration: .8,
            transform: "rotateX(0deg)",
            stagger: 0.05,
            // ease: "power2.out",
            ease: "bounce.out",
            delay: .8
        })

        const tl2 = gsap.timeline({
            scrollTrigger: {
              trigger: "#title-main-wrap51",
              scroller: "body",
              start: "top 70%",
              end: "top 50%",
              // scrub: true,
            //   markers: true
            }
          })
          tl2.fromTo('#title-main-wrap51 span',  {
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
        <div className={styles.shopSection5}>
            <Image width={1000} height={1000} src="/newproduct/BI02.jpg" alt='ig5-banner' />
            <div className={styles.overlay5}>
                <div id='title-main-wrap5'>
                    <h2>The person</h2>
                    <h2>behind the brand</h2>
                </div>
                <div className={styles.bigCardContainer}>
                    <div className={styles.bigCard}>
                        <video autoPlay muted loop playsInline src="https://emmpo.com/assets/395808beb2e10735b70b.mp4"></video>
                        <p>follow my instagram</p>
                    </div>
                </div>
                <h2 id='title-main-wrap51'>Hey there!</h2>
            </div>
        </div>
    )
}

export default Section5