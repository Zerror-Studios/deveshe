import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { useEffect } from 'react'
import styles from './archive.module.css'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'
gsap.registerPlugin(ScrollTrigger)


const Section3 = () => {

    useGSAP(() => {
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#archiveSection3",
                scroller: "body",
                start: "top -0%",
                end: "top -400%",
                pin: true,
                // markers: true,
                scrub: 1
            }
        })

        tl.to("#elem1", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
            backgroundPosition: "0 110%",
            duration: 1.5,
            // delay: .1
        }, "a")

        tl.to("#elem2", {
            clipPath: ` polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
            backgroundPosition: "0 25%",
            duration: 1.5,
            // delay: .1
        }, "a")
        tl.fromTo("#textc2", {
            y: 50,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            delay: .8,
            duration: .4
        }, "a")

        tl.to("#elem2", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
            backgroundPosition: "0 110%",
            duration: 1.5
        }, "b")
        tl.to("#elem3", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
            backgroundPosition: "0 25%",
            duration: 1.5
        }, "b")
        tl.fromTo("#textc3", {
            y: 50,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            delay: .8,
            duration: .4
        }, "b")
        tl.to("#elem3", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
            backgroundPosition: "0 110%",
            duration: 1.5
        }, "c")

        tl.to("#elem4", {
            clipPath: ` polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
            backgroundPosition: "0 25%",
            duration: 1.5
        }, "c")
        tl.fromTo("#textc4", {
            y: 50,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            ease: "power2.out",
            delay: .8,
            duration: .4
        }, "c")

        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        return () => tl.kill();
    }, [])

    return (
        <div id="archiveSection3" className={styles.archiveSection3}>
            <Link href="/chapter1" className={`${styles.elem} ${styles.elem1}`} id='elem1'>
                <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc1'>
                        <h3>Chapter 1</h3>
                        <h4>What’s on the menu?</h4>
                        <p>A tribute to food lovers everywhere, this summery capsule collection was created in collaboration with visual artist Rhea Zaveri. Inspired by abstract recipes, each print layers ingredients in playful proportions—think avocado toast, jalapeño bucatini, and watermelon lemonade. A vibrant nod to shared cravings and creative expression.</p>
                        <span className={styles.exploreBtn}>Explore <FiArrowUpRight /></span>
                    </div>
                </div>
            </Link>
            <Link href="/chapter1" className={`${styles.elem} ${styles.elem2}`} id='elem2'>
                <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc2'>
                        <h3>Chapter 2</h3>
                        <h4> Its all about crochet!</h4>
                        <p>A celebration of festive elegance, this collection with artist Bindal Shah features handcrafted metallic crochet on vibrant ombré silks. In jewel tones of ruby, emerald, ochre, and blue, each piece blends lightness with intricate detail—perfect for wedding soirées and Diwali nights. Fusion wear made effortless, ornate, and unforgettable.</p>
                        <span className={styles.exploreBtn} >Explore <FiArrowUpRight /></span>
                    </div>
                </div>
            </Link>
            <Link href="/chapter1" className={`${styles.elem} ${styles.elem3}`} id='elem3'>
                <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc3'>
                        <h3>Chapter 3</h3>
                        <h4>What’s on the menu?</h4>
                        <p>A tribute to food lovers everywhere, this summery capsule collection was created in collaboration with visual artist Rhea Zaveri. Inspired by abstract recipes, each print layers ingredients in playful proportions—think avocado toast, jalapeño bucatini, and watermelon lemonade. A vibrant nod to shared cravings and creative expression.</p>
                        <span className={styles.exploreBtn}>Explore <FiArrowUpRight /></span>
                    </div>
                </div>
            </Link>
            <Link href="/chapter1" className={`${styles.elem} ${styles.elem4}`} id='elem4'>
                <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc4'>
                        <h3>Chapter 4</h3>
                        <h4>Its all about crochet!</h4>
                        <p>A tribute to food lovers everywhere, this summery capsule collection was created in collaboration with visual artist Rhea Zaveri. Inspired by abstract recipes, each print layers ingredients in playful proportions—think avocado toast, jalapeño bucatini, and watermelon lemonade. A vibrant nod to shared cravings and creative expression.</p>
                        <span className={styles.exploreBtn}>Explore <FiArrowUpRight /></span>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default Section3