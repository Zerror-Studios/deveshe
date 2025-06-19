import React from 'react'
import styles from "../shop/shop.module.css"
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const Section6 = () => {

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
          splitText('#title-main-wrap6 h2')
          const tl2 = gsap.timeline({
              scrollTrigger: {
                trigger: "#title-main-wrap6",
                scroller: "body",
                start: "top 80%",
                end: "top 50%",
                // scrub: true,
                // markers: true
              }
            })
            tl2.fromTo('#title-main-wrap6 span',  {
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
    <div className={styles.shopSection6}>
        <div id='title-main-wrap6'>
           <h2>It's great to see you</h2>
<h2>on <span>your journey</span> to</h2>
<h2>discovering your</h2>
<h2>style</h2>

        </div>
        <Image height={1000} width={1000} alt='image' src="https://emmpo.com/assets/af3020a78265de970759.png"/>
    </div>
  )
}

export default Section6