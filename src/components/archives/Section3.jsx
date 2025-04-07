import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { useEffect } from 'react'
import styles from './archive.module.css'
import { useGSAP } from '@gsap/react'
gsap.registerPlugin(ScrollTrigger)


const Section3 = () => {

    useGSAP(() => {
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#archiveSection3",
                scroller: "body",
                start: "top -0%",
                end: "top -350%",
                pin: true,
                // markers: true,
                scrub: 1
            }
        })

        tl.to("#elem1", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
            backgroundPosition: "0 200%",
            duration:1.5,
            delay:.1
        }, "a")

        tl.to("#elem2", {
            clipPath: ` polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
            backgroundPosition: "0 100%",
            duration:1.5,
            delay:.1
        }, "a")
        tl.fromTo("#textc2",{
            y:50,
            opacity:0
        },{
            y:0,
            opacity:1,
            ease: "power2.out",
            delay:.8,
            duration:.4
        },"a")

        tl.to("#elem2", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
            backgroundPosition: "0 200%",
            duration:1.5
        }, "b")
        tl.to("#elem3", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
            backgroundPosition: "0 100%",
            duration:1.5
        }, "b")
        tl.fromTo("#textc3",{
            y:50,
            opacity:0
        },{
            y:0,
            opacity:1,
            ease: "power2.out",
            delay:.8,
            duration:.4
        },"b")
        tl.to("#elem3", {
            clipPath: `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`,
            backgroundPosition: "0 200%",
            duration:1.5
        }, "c")

        tl.to("#elem4", {
            clipPath: ` polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
            backgroundPosition: "0 100%",
            duration:1.5
        }, "c")
        tl.fromTo("#textc4",{
            y:50,
            opacity:0
        },{
            y:0,
            opacity:1,
            ease: "power2.out",
            delay:.8,
            duration:.4
        },"c")

        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        return () => tl.kill();
    }, [])

    return (
        <div id="archiveSection3" className={styles.archiveSection3}>
            <div className={`${styles.elem} ${styles.elem1}`} id='elem1'>
                <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc1'>
                        <h4>Chapter One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
            </div>
            <div className={`${styles.elem} ${styles.elem2}`} id='elem2'>
            <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc2'>
                        <h4>Chapter One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
            </div>
            <div className={`${styles.elem} ${styles.elem3}`} id='elem3'>
            <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc3'>
                        <h4>Chapter One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
            </div>
            <div className={`${styles.elem} ${styles.elem4}`} id='elem4'>
            <div className={styles.overlay3a}>
                    <div className={styles.textContainer} id='textc4'>
                        <h4>Chapter One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Section3