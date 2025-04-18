import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import React from 'react'
gsap.registerPlugin(ScrollTrigger)

const Section2 = () => {

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
        <img src="/lb-banner.webp" alt="" />
        <div id="main-banner-text">
          <p>With Black Ops 6 returning to the iconic 90s period, we wanted to create a collection that evokes a sense of nostalgia.</p>
        </div>
        <div id='overlay-lb2'></div>
      </div>
    </div>
  )
}

export default Section2