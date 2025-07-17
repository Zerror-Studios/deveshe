import gsap from "gsap";
import ScrollToPlugin from "gsap/dist/ScrollToPlugin";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const HomeSlider = () => {
  const scrollRef = useRef(null);
  const homeRef = useRef(null);

  useEffect(() => {
    const slider = scrollRef.current;
    const home = homeRef.current;

    if (!slider || !home) return;

    const totalScrollWidth = slider.scrollWidth - slider.clientWidth;

    let currentScroll = 0;
    let targetScroll = 0;
    const isMobile = window.innerWidth <= 576;
    const lerpFactor = isMobile ? 0.07 : 0.1;

    gsap.to(
      {},
      {
        scrollTrigger: {
          trigger: home,
          start: "top top",
          end: () => `+=${totalScrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          // markers: true,
          onUpdate: (self) => {
            targetScroll = self.progress * totalScrollWidth;
          },
        },
        duration: 1,
        ease: "none",
        onUpdate: () => {
          currentScroll += (targetScroll - currentScroll) * 0.07; // lerp smoothing
          slider.scrollLeft = currentScroll;
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={homeRef} className="home-slider">
      <div
        className="horizontal-scroll"
        ref={scrollRef}
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          scrollBehavior: "auto",
        }}
      >
        <div className="slide1">
          <Image width={1000} height={1000} src="/images/bg1.png" alt="image" />
          <div className="slide1-container">
            <Image
              id={`sl1-ig1`}
              width={1000}
              height={1000}
              src={`/images/img1.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig2`}
              width={1000}
              height={1000}
              src={`/images/img2.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig3`}
              width={1000}
              height={1000}
              src={`/images/img3.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig4`}
              width={1000}
              height={1000}
              src={`/images/sticker7.png`}
              alt="image"
            />
             <Image
              id={`sl1-ig44`}
              width={1000}
              height={1000}
              src={`/images/sticker7.png`}
              alt="image"
            />
            <Image
              id={`sl1-ig5`}
              width={1000}
              height={1000}
              src={`/images/img5.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig6`}
              width={1000}
              height={1000}
              src={`/images/sticker (9).png`}
              alt="image"
            />
            <Image
              id={`sl1-ig7`}
              width={1000}
              height={1000}
              src={`/images/sticker5.png`}
              alt="image"
            />
            <Image
              id={`sl1-ig8`}
              width={1000}
              height={1000}
              src={`/images/img8.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig9`}
              width={1000}
              height={1000}
              src={`/images/img9.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig11`}
              width={1000}
              height={1000}
              src={`/images/img11.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig12`}
              width={1000}
              height={1000}
              src={`/images/sticker (10).png`}
              alt="image"
            />
             <Image
              id={`sl1-ig122`}
              width={1000}
              height={1000}
              src={`/images/sticker9.png`}
              alt="image"
            />
               <Image
              id={`sl1-ig1222`}
              width={1000}
              height={1000}
              src={`/images/sticker (13).png`}
              alt="image"
            />
            <Image
              id={`sl1-ig13`}
              width={1000}
              height={1000}
              src={`/images/img13.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig14`}
              width={1000}
              height={1000}
              src={`/images/img14.webp`}
              alt="image"
            />
            <Image
              id={`sl1-ig15`}
              width={1000}
              height={1000}
              src={`/images/sticker (14).png`}
              alt="image"
            />
            <Image
              id={`sl1-ig16`}
              width={1000}
              height={1000}
              src={`/images/img16.webp`}
              alt="image"
            />
          </div>
        </div>
        <div className="slide2">
          <Image width={1000} height={1000} src="/images/bg1.png" alt="image" />
          <div className="slide1-container">
            <Image
              id="sl2-ig1"
              width={1000}
              height={1000}
              src="/images/im1.webp"
              alt="image"
            />
            <Image
              id="sl2-ig2"
              width={1000}
              height={1000}
              src="/images/im2.webp"
              alt="image"
            />
            <Image
              id="sl2-ig3"
              width={1000}
              height={1000}
              src="/images/sticker (8).png"
              alt="image"
            />
              <Image
              id="sl2-ig33"
              width={1000}
              height={1000}
              src="/images/sticker (6).png"
              alt="image"
            />
            <Image
              id="sl2-ig4"
              width={1000}
              height={1000}
              src="/images/im4.webp"
              alt="image"
            />
            <Image
              id="sl2-ig5"
              width={1000}
              height={1000}
              src="/images/im5.webp"
              alt="image"
            />
            <Image
              id="sl2-ig6"
              width={1000}
              height={1000}
              src="/images/im6.webp"
              alt="image"
            />
            <Image
              id="sl2-ig7"
              width={1000}
              height={1000}
              src="/images/im7.webp"
              alt="image"
            />
            <Image
              id="sl2-ig8"
              width={1000}
              height={1000}
              src="/images/sticker (1).png"
              alt="image"
            />
            <Image
              id="sl2-ig9"
              width={1000}
              height={1000}
              src="/images/im9.webp"
              alt="image"
            />
            <Image
              id="sl2-ig10"
              width={1000}
              height={1000}
              src="/images/im10.webp"
              alt="image"
            />
            <Image
              id="sl2-ig11"
              width={1000}
              height={1000}
              src="/images/im10.webp"
              alt="image"
            />
            <Image
              id="sl2-ig12"
              width={1000}
              height={1000}
              src="/images/im10.webp"
              alt="image"
            />
            <Image
              id="sl2-ig13"
              width={1000}
              height={1000}
              src="/images/sticker4.png"
              alt="image"
            />
            <Image
              id="sl2-ig14"
              width={1000}
              height={1000}
              src="/images/im12.webp"
              alt="image"
            />
            <Image
              id="sl2-ig15"
              width={1000}
              height={1000}
              src="/images/im13.webp"
              alt="image"
            />
            <Image
              id="sl2-ig16"
              width={1000}
              height={1000}
              src="/images/im14.webp"
              alt="image"
            />
            <Image
              id="sl2-ig17"
              width={1000}
              height={1000}
              src="/images/im15.webp"
              alt="image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;
