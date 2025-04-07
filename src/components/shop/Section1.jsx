import React, { useEffect } from 'react'
import styles from './shop.module.css'
import Image from 'next/image'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const Section1 = () => {
    // useEffect(() => {
    //     var tl = gsap.timeline({
    //         scrollTrigger: {
    //             trigger: "#shopSection1",
    //             start: "top 8%",
    //             end: "top 0%",
    //             scrub: true,
    //         }
    //     })
    //     tl
    //         .to("header", {
    //             top: "0%",
    //             delay: 1,
    //             duration:.5
    //         }, "a")
    //         .to(".home-slider", {
    //             top: "-100%",
    //             delay: 1,
    //             duration:.5
    //         }, "a")
    // }, [])
    return (
        <div className={styles.shopSection1} id='shopSection1'>
            <Image fill priority  src="https://emmpo.com/assets/846faa9c110b840e7cd7.png" alt='shop-banner' />
        </div>
    )
}

export default Section1