import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const VisionSection = () => {
  const router = useRouter();
  const imageRef = useRef(null);

  useEffect(() => {
    // Split text into <span> only once
    function splitText(selector) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.dataset.split) {
          const letters = el.textContent
            .split("")
            .map((char) =>
              char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
            );
          el.innerHTML = letters.join("");
          el.dataset.split = "true";
        }
      });
    }

    splitText(".vision_text h2");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#vision_section",
          start: "top 85%",
          end: "top 55%",
          // scrub: true,
          // markers: true,
        },
      });

      tl.fromTo(
        ".vision_text h2 span",
        { rotateX: "90deg" },
        {
          duration: 0.8,
          rotateX: "0deg",
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => ctx.revert();
  }, []);

  // Global mousemove parallax effect
  useEffect(() => {
    const img = imageRef.current;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // subtle (range ~ -10px to +10px)
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      gsap.to(img, {
        x,
        y,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
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

  const handleClick = () => {
    router.push("/about");
  };

  return (
    <div id="vision_section">
      <Image
        ref={imageRef}
        width={1000}
        height={1000}
        src="/scrapbook/2girl.png"
        alt="image"
      />

      <div className="vision_text">
        <h2 className="red">The vision</h2>
        <h2>behind the brand</h2>
      </div>

      <div className="vision_text2">
        <h6>Built on artistic instinct and expression</h6>
        <p>
          Born from a love for daydreaming and storytelling through clothes,
          DeVeSheDreams turns imagination into
          <strong> limited-edition pieces made with purpose</strong> and
          personality.
        </p>
        <div
          onClick={handleClick}
          onMouseEnter={enterHandler}
          className="explore_inspired_button"
        >
          [
          <div className="inspired_button_wrap" id="btn-text-wrap">
            <h4 className="text1-btn">Read More</h4>
            <h4 className="text2-btn">Read More</h4>
          </div>
          ]
        </div>
      </div>
    </div>
  );
};

export default VisionSection;
