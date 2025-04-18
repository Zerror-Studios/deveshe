import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React from 'react'
gsap.registerPlugin(ScrollTrigger)
const Section1 = () => {

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#lookbook-Sec1",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            }
        })
        tl.to("#lookbook-Sec1 .lb-header-image img",{ scale: 1.2,duration: 1 })
    }, [])

    return (
        <div id='lookbook-Sec1'>
            <div className='lb-header-wrapper'>
                <div className='lb-header'>
                    <div className="lb-header-text">
                        <h2>What’s on the menu?</h2>
                        <p>[Chapter 1]</p>
                    </div>
                </div>
            </div>
            <div className='lb-header-image'>
                <img src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2796x1573%2F43f4ad734f%2Fcod-ban-plp.jpg&w=3840&q=90" alt="" />
            </div>
        </div>
    )
}

export default Section1