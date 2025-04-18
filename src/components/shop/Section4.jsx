import React from 'react'
import styles from "./shop.module.css"
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const Section4 = () => {
     useGSAP(()=>{
            document.querySelectorAll('#title-main-wrap2 h2').forEach((h) => {
                var clutter = ""
                h.textContent.split("").forEach((letter, i) => {
                    clutter += `<span>${letter}</span>`
                })
                h.innerHTML = clutter
            });
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#section4-shop",
                    scroller:"body",
                    start: "top 70%",
                    end: "top 40%",
                    // scrub: true,
                    // markers:true
                }
            })
            tl.fromTo('#title-main-wrap2 h2 span',{
                transform: "rotateX(90deg)",
            } ,{
                duration: .8,
                transform:"rotateX(0deg)",
                stagger: 0.05,
                // ease: "power2.out",
                ease: "bounce.out",
            })

            setTimeout(() => {
                ScrollTrigger.refresh();
            },500)
        },[])
    return (
        <div className={styles.shopSection4} id='section4-shop'>
            <div className={styles.topCont}>
                <div className={styles.topContHeader} id='title-main-wrap2'>
                    <h2>The <span>science</span></h2>
                    <h2>behind the quiz</h2>
                </div>
                <div className={styles.bottomContPara}>
                    <h6>We leverage a model that is based on</h6>
                    <p>vocational psychology research that has been validated in studies repeatedly during the last 50 years, making it a <span>scientifically grounded tool for career</span> assessment and guidance.</p>
                </div>
            </div>
            <div className={styles.bottomCont}>
                <Image width={1000} height={1000} src="https://emmpo.com/assets/ce3c8196da068a1ba841.png" alt='image'/>
            </div>
        </div>
    )
}

export default Section4