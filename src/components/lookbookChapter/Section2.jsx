import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import Image from 'next/image'
import React from 'react'
gsap.registerPlugin(ScrollTrigger)

const Section2 = ({text}) => {

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#lb-banner2",
        start: "top -40%",
        end: "top -100%",
        scrub: true,
        // markers: true,
      }
    })
    tl.fromTo("#overlay-lb2", {
      opacity: 0,
    }, {
      opacity: 1,
      duration: 1,
    })
    tl.to("#main-banner-text", {
      // bottom: 0,
      opacity: 1,
      duration: 1,
    })
    tl.to("#main-banner-text", {
      bottom: 0,
      duration: 2,
    })

  }, [])

  return (
    <div id='lb-banner2'>
      <div id="main-banner-container">
        <Image width={1000} height={1000} src="/lb-banner.webp" alt="image" />
        <div id="main-banner-text">
          <p>{text}</p>
        </div>
        <div id='overlay-lb2'></div>
      </div>
    </div>
  )
}

export default Section2