import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import Image from 'next/image'
import React, { useEffect } from 'react'
gsap.registerPlugin(ScrollTrigger)

const ImageSectionTwo = () => {
    useEffect(() => {
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
        <div className='lb-sec4-img'>
            <Image width={1000} height={1000} src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F2796x1573%2F45490dc7df%2Fdt-cu-2.jpg&w=1920&q=90" alt="" />
        </div>
        <div className='lb-sec4-img'>
            <Image width={1000} height={1000} src="https://ark8.net/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F161230%2F1500x844%2Fa6c583fb3c%2Fdogtag1-2.jpg&w=1920&q=90" alt="" />
        </div>
    </div>
  )
}

export default ImageSectionTwo;