import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

const HomeSlider = ({ homeRef }) => {
  const scrollRef = useRef(null);

 
  // useEffect(() => {
  //   const handleWheel = (e) => {
  //     if (scrollRef.current) {
  //       scrollRef.current.scrollLeft += e.deltaY;
  //     }
  //   };

  //   const slider = scrollRef.current;
  //   if (slider) {
  //     slider.addEventListener('wheel', handleWheel);
  //   }

  //   return () => {
  //     if (slider) {
  //       slider.removeEventListener('wheel', handleWheel);
  //     }
  //   };
  // }, []);


  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;
  
    // Desktop: Horizontal scroll using mouse wheel
    const handleWheel = (e) => {
      slider.scrollLeft += e.deltaY;
    };
  
    // Mobile: Track touch movement
    let startX = 0;
    let scrollLeft = 0;
  
    const handleTouchStart = (e) => {
      startX = e.touches[0].pageX;
      scrollLeft = slider.scrollLeft;
    };
  
    const handleTouchMove = (e) => {
      const x = e.touches[0].pageX;
      const walk = startX - x; // how far you moved your finger
      slider.scrollLeft = scrollLeft + walk;
    };
  
    // Add listeners
    slider.addEventListener('wheel', handleWheel);
    slider.addEventListener('touchstart', handleTouchStart);
    slider.addEventListener('touchmove', handleTouchMove);
  
    // Clean up
    return () => {
      slider.removeEventListener('wheel', handleWheel);
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  

  return (
    <div ref={homeRef} className='home-slider'>
      <h2 id='logo-h'>de ve she dreams</h2>
      <div className='horizontal-scroll' ref={scrollRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div className='slide1'>
          <Image
             width={1000}
            height={1000}
            src="https://dieselfarm.com/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2FBG.46b433ec.webp&w=3840&q=65"
            alt="image"
          />
          <div className='slide1-container'>
            {[...Array(16)].map((_, i) => (
              <Image
                key={i}
                id={`sl1-ig${i + 1}`}
                width={1000}
                height={1000}
                src={`/images/img${i + 1}.webp`}
                alt='image'
              />
            ))}
          </div>
        </div>
        <div className='slide2'>
          <Image
            width={1000}
            height={1000}
            src="https://dieselfarm.com/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2FBG.3a61546b.webp&w=3840&q=65"
            alt="image"
          />
          <div className='slide1-container'>
            <Image id='sl2-ig1' width={1000} height={1000} src="/images/im1.webp" alt='image' />
            <Image id='sl2-ig2' width={1000} height={1000} src="/images/im2.webp" alt='image' />
            <Image id='sl2-ig3' width={1000} height={1000} src="/images/im3.webp" alt='image' />
            <Image id='sl2-ig4' width={1000} height={1000} src="/images/im4.webp" alt='image' />
            <Image id='sl2-ig5' width={1000} height={1000} src="/images/im5.webp" alt='image' />
            <Image id='sl2-ig6' width={1000} height={1000} src="/images/im6.webp" alt='image' />
            <Image id='sl2-ig7' width={1000} height={1000} src="/images/im7.webp" alt='image' />
            <Image id='sl2-ig8' width={1000} height={1000} src="/images/im8.webp" alt='image' />
            <Image id='sl2-ig9' width={1000} height={1000} src="/images/im9.webp" alt='image' />
            <Image id='sl2-ig10' width={1000} height={1000} src="/images/im10.webp" alt='image' />
            <Image id='sl2-ig11' width={1000} height={1000} src="/images/im10.webp" alt='image' />
            <Image id='sl2-ig12' width={1000} height={1000} src="/images/im10.webp" alt='image' />
            <Image id='sl2-ig13' width={1000} height={1000} src="/images/im11.webp" alt='image' />
            <Image id='sl2-ig14' width={1000} height={1000} src="/images/im12.webp" alt='image' />
            <Image id='sl2-ig15' width={1000} height={1000} src="/images/im13.webp" alt='image' />
            <Image id='sl2-ig16' width={1000} height={1000} src="/images/im14.webp" alt='image' />
            <Image id='sl2-ig17' width={1000} height={1000} src="/images/im15.webp" alt='image' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;
