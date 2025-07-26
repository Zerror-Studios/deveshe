import gsap from "gsap";
import ScrollToPlugin from "gsap/dist/ScrollToPlugin";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const AboutHeroSection = () => {
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
        <div class="slide1">
          <Image
            width={1000}
            height={1000}
            src="/scrapbook/bg1.png"
            alt="background"
          />
          <div class="slide1-container">
            <Image
              width={1000}
              height={1000}
              id="paper-top"
              src="/scrapbook/paper-top.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="slide1-bg"
              src="/scrapbook/slide1-bg.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="flower2"
              src="/scrapbook/flower2.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="flower1"
              src="/scrapbook/flower1.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="girl"
              src="/scrapbook/2girl.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="car"
              src="/scrapbook/car.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="flower3"
              src="/scrapbook/flower3.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="camera"
              src="/scrapbook/camera.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="cherry"
              src="/scrapbook/cherry.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="love"
              src="/scrapbook/love.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="yellow"
              src="/scrapbook/yl.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="ballon"
              src="/scrapbook/bl.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="heart"
              src="/scrapbook/heart.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="girl2"
              src="/scrapbook/girl2.png"
              alt=""
            />
          </div>
        </div>
        <div class="slide2">
          <Image
            width={1000}
            height={1000}
            src="/scrapbook/bg1.png"
            alt="background"
          />
          <div class="slide1-container">
            <Image
              width={1000}
              height={1000}
              id="paper-top2"
              src="/scrapbook/paper-top2.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="slide2-bg"
              src="/scrapbook/slide2-bg.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="plant1"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="plant2"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="plant3"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="plant4"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="flower5"
              src="/scrapbook/flower5.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="flower4"
              src="/scrapbook/flower4.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="flower7"
              src="/scrapbook/flower7.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="heart1"
              src="/scrapbook/heart.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="heart2"
              src="/scrapbook/heart2.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="heart3"
              src="/scrapbook/heart3.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="coupn"
              src="/scrapbook/coupn.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              id="letter"
              src="/scrapbook/letter.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutHeroSection;
