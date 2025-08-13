import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);
const ExploreSection = () => {

  useEffect(() => {
  // Split text into spans
  const splitText = (selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.dataset.split) {
        el.innerHTML = el.textContent
          .split("")
          .map((char) => `<span>${char === " " ? "&nbsp;" : char}</span>`)
          .join("");
        el.dataset.split = "true";
      }
    });
  };
  splitText(".explore_text_container h2");
  splitText(".inspired_button_wrap h4");

  const ctx = gsap.context(() => {
    // Heading animation
    gsap.timeline({
      scrollTrigger: { trigger: "#explore_section", start: "top 60%", end: "top 20%" }
    }).fromTo(
      ".explore_text_container h2 span",
      { rotateX: "90deg" },
      { rotateX: "0deg", duration: 0.8, stagger: 0.05, ease: "bounce.out" }
    );

    // Strip animation
    const stripY = window.innerWidth < 576 ? -100 : -200;
    gsap.timeline({
      scrollTrigger: { trigger: ".explore_inspired_container", start: "top 70%", end: "top 20%" }
    })
      .fromTo(
        ".explore_strip1",
        { y: stripY, x: -300, rotation: -25, scale: 0.8 },
        { y: 0, x: 0, rotation: -25, scale: 1, duration: 1.5, ease: "power2.out" },
        "a"
      )
      .fromTo(
        ".explore_strip2",
        { y: stripY, x: 300, rotation: 25, scale: 0.8 },
        { y: 0, x: 0, rotation: 25, scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" },
        "a"
      );

    //   btn animation

     

    setTimeout(() => ScrollTrigger.refresh(), 100);
  });

  return () => ctx.revert();
}, []);

const enterHandler = () => {
        gsap.fromTo(
          ".text1-btn span",
          { y: "0%" },
          {
            y: "-100%",
            duration: 0.5,
            stagger: { amount: 0.2 },
          }
        );
        gsap.fromTo(
          ".text2-btn span",
          { y: "0%" },
          {
            y: "-100%",
            duration: 0.5,
            stagger: { amount: 0.2 },
          }
        );
      };


  return (
    <div id="explore_section">
      <div className="explore_text_container">
        <h2>Explore</h2>
        <h2 id="red">styles that</h2>
        <h2>feel like</h2>
        <h2>you.</h2>
      </div>
      <div className="explore_polaroid_container">
        <div className="explore_side_card explore_side_card1">
          <Image
            width={1000}
            height={1000}
            src="/assets/images/home/explore3.jpg"
            alt="explore"
          />
        </div>
        <div className="explore_center_card">
          <Image
            width={1000}
            height={1000}
            src="/assets/images/home/explore1.jpg"
            alt="explore"
          />
          <p>
            Find pieces that reflect who you are — easy to wear, made to love.
          </p>
        </div>
        <div className="explore_side_card explore_side_card2">
          <Image
            width={1000}
            height={1000}
            src="/assets/images/home/explore2.jpg"
            alt="explore"
          />
        </div>
      </div>
      <div className="explore_inspired_container">
        <h5>All inspired by</h5>
        <div>
          <h3>Creativity,<br />Collaboration, <br />and Craft.</h3>
        </div>
         <div onMouseEnter={enterHandler} className="explore_inspired_button">
          [
          <div className="inspired_button_wrap" id="btn-text-wrap">
            <h4 className="text1-btn">Shop Now</h4>
            <h4 className="text2-btn">Shop Now</h4>
          </div>
          ]
        </div>
         <Image
            width={1000}
            height={1000}
            className="explore_strip1"
            src="/assets/images/home/hero_strip1.webp"
            alt="explore"
          />
           <Image
            width={1000}
            height={1000}
            className="explore_strip2"
            src="/assets/images/home/hero_strip2.webp"
            alt="explore"
          />
      </div>
      
    </div>
  );
};

export default ExploreSection;
