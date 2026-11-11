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

    const scrollTween = gsap.to(
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

    // Only this component's trigger (SF-20)
    return () => {
      scrollTween.scrollTrigger?.kill();
      scrollTween.kill();
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
          <Image
            width={1000}
            height={525}
            sizes="100vw"
            preload
            src="/scrapbook/bg1.png"
            alt="background"
          />
          <div className="slide1-container">
            <Image
              width={1000}
              height={196}
              sizes="100vw"
              id="slide1-bg"
              preload
              src="/scrapbook/ground1.png"
              alt=""
            />
             <Image
              width={1000}
              height={754}
              sizes="60vw"
              id="building1"
              preload
              src="/scrapbook/building1.png"
              alt=""
            />
              <Image
              width={1000}
              height={1491}
              sizes="60vw"
              id="girl1"
              src="/scrapbook/girl1.png"
              alt=""
            />
             <Image
              width={1000}
              height={94}
              sizes="100vw"
              id="ground1-over"
              src="/scrapbook/ground1-over.png"
              alt=""
            />
            <Image
              width={1000}
              height={1601}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="flower2"
              src="/scrapbook/flower2.png"
              alt=""
            />
            <Image
              width={1000}
              height={1183}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="flower1"
              src="/scrapbook/flower1.png"
              alt=""
            />
            <Image
              width={1000}
              height={1086}
              sizes="60vw"
              id="girl"
              src="/scrapbook/2girl.png"
              alt=""
            />
            <Image
              width={1000}
              height={309}
              sizes="100vw"
              id="car"
              src="/scrapbook/car.png"
              alt=""
            />
            <Image
              width={1000}
              height={983}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="flower3"
              src="/scrapbook/flower3.png"
              alt=""
            />
            <Image
              width={1000}
              height={730}
              sizes="60vw"
              id="camera"
              src="/scrapbook/camera.png"
              alt=""
            />
            <Image
              width={1000}
              height={1023}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="cherry"
              src="/scrapbook/cherry.png"
              alt=""
            />
            <Image
              width={1000}
              height={873}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="love"
              src="/scrapbook/love.png"
              alt=""
            />
            <Image
              width={1000}
              height={1450}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="yellow"
              src="/scrapbook/yl.png"
              alt=""
            />
            <Image
              width={1000}
              height={1185}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="ballon"
              src="/scrapbook/bl.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="heart"
              src="/scrapbook/heart.png"
              alt=""
            />
            <Image
              width={1000}
              height={2464}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="girl2"
              src="/scrapbook/girl2.png"
              alt=""
            />
          </div>
        </div>
        <div className="slide2">
          <Image
            width={1000}
            height={525}
            sizes="100vw"
            src="/scrapbook/bg1.png"
            alt="background"
          />
          <div className="slide1-container">
            <Image
              width={1000}
              height={487}
              sizes="100vw"
              id="slide2-bg"
              src="/scrapbook/slide2-bg2.png"
              alt=""
            />
            <Image
              width={1000}
              height={1535}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="plant1"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1535}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="plant2"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1535}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="plant3"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={1535}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="plant4"
              src="/scrapbook/plant.png"
              alt=""
            />
            <Image
              width={1000}
              height={637}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="flower5"
              src="/scrapbook/flower5.png"
              alt=""
            />
            <Image
              width={1000}
              height={1440}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="flower4"
              src="/scrapbook/flower4.png"
              alt=""
            />
            <Image
              width={1000}
              height={1544}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="flower7"
              src="/scrapbook/flower7.png"
              alt=""
            />
            <Image
              width={1000}
              height={1000}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="heart1"
              src="/scrapbook/heart.png"
              alt=""
            />
            <Image
              width={1000}
              height={766}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="heart2"
              src="/scrapbook/heart2.png"
              alt=""
            />
            <Image
              width={1000}
              height={1008}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="heart3"
              src="/scrapbook/heart3.png"
              alt=""
            />
            <Image
              width={1000}
              height={763}
              sizes="(max-width: 768px) 70vw, 30vw"
              id="coupn"
              src="/scrapbook/coupn.png"
              alt=""
            />
            <Image
              width={1000}
              height={1218}
              sizes="(max-width: 768px) 70vw, 30vw"
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
