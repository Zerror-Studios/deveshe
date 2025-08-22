import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import Image from 'next/image'
import React, { useEffect } from 'react'
gsap.registerPlugin(ScrollTrigger)

const ImageSectionTwo = ({ leftData, rightData }) => {
    useEffect(() => {
    if (window.innerWidth < 576) return;

      const ctx = gsap
      .context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#lb-section4",
            start: "top bottom",     // element top hits bottom of viewport
            end: "bottom top",          // element top reaches top of viewport
            scrub: 1,
            // markers: true,    
          },
        });
  
        tl.to("#lb-section4 img", {
          y: 50,
          duration: 1,
          ease: "none",
        });
  
        setTimeout(() => ScrollTrigger.refresh(), 100); // handle layout shifts
      });
  
      return () => ctx.revert();
    }, []);
  return (
    <div id='lb-section4'>
      {leftData && (
        <div className='lb-sec4-img'>
            <Image width={1000} height={1000} src={leftData?.imageUrl || ""} alt="" />
        </div>
      )}
      {rightData && (
        <div className='lb-sec4-img'>
            <Image width={1000} height={1000} src={rightData?.imageUrl || ""} alt="" />
        </div>
      )}
    </div>
  )
}

export default ImageSectionTwo;