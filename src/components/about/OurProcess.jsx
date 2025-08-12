import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
gsap.registerPlugin(ScrollTrigger);
const OurProcess = () => {
  useEffect(() => {
    const blackPaths = document.querySelectorAll(".path-black");
    const colorPaths = document.querySelectorAll(".path-color");

    // Prepare all paths for animation (set them hidden initially)
    [...blackPaths, ...colorPaths].forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

    // Timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".ranbow-vertical__1-svg",
        start: "top 110%",
        end: "bottom 50%",
        scrub: true,
      },
    });

    // Animate black + color together for each strip
    blackPaths.forEach((black, i) => {
      const color = colorPaths[i];

      tl.to(
        [black, color],
        {
          strokeDashoffset: 0,
          duration: 1,
        },
        "+=0.2"
      ); // small gap before next strip starts
    });
  }, []);

  return (
    <div id="our_process">
      <div className="process_container">
        <div className="process_strip">
          <div className="porcess_content">
            <h4>Our Process</h4>
            <p>
              We’re committed to a seamless process that balances innovation,
              communication, and execution.
            </p>
          </div>
          <div className="process_card">
            <div className="process_img">
              <Image
                width={1000}
                height={1000}
                src="/assets/images/about/img1.webp"
                alt="process image 1"
              />
            </div>
            <p>
              Devs want Steph; <span>designers</span> want to be her. She’s{" "}
              <span>rocking</span> web work and sharing freelancer tips.
            </p>
          </div>
        </div>
        <div className="process_strip">
          <div className="process_card">
            <div className="process_img">
              <Image
                width={1000}
                height={1000}
                src="/assets/images/about/img2.webp"
                alt="process image 1"
              />
            </div>
            <p>
              Devs want Steph; <span>designers</span> want to be her. She’s{" "}
              <span>rocking</span> web work and sharing freelancer tips.
            </p>
          </div>
          <div className="process_card">
            <div className="process_img">
              <Image
                width={1000}
                height={1000}
                src="/assets/images/about/img3.webp"
                alt="process image 1"
              />
            </div>
            <p>
              Devs want Steph; <span>designers</span> want to be her. She’s{" "}
              <span>rocking</span> web work and sharing freelancer tips.
            </p>
          </div>
        </div>
        <div className="process_strip">
          <div className="process_card">
            <div className="process_img">
              <Image
                width={1000}
                height={1000}
                src="/assets/images/about/img4.webp"
                alt="process image 1"
              />
            </div>
            <p>
              Devs want Steph; <span>designers</span> want to be her. She’s{" "}
              <span>rocking</span> web work and sharing freelancer tips.
            </p>
          </div>
          <div className="process_card">
            <div className="process_img">
              <Image
                width={1000}
                height={1000}
                src="/assets/images/about/img5.webp"
                alt="process image 1"
              />
            </div>
            <p>
              Devs want Steph; <span>designers</span> want to be her. She’s{" "}
              <span>rocking</span> web work and sharing freelancer tips.
            </p>
          </div>
        </div>
      </div>
      <div className="process_svg">
        <div className="process-rainbow">
          <div className="rainbow-vertical">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              viewBox="0 0 452 600"
              fill="none"
              preserveAspectRatio="none"
              className="ranbow-vertical__1-svg"
            >
              <path
                d="M426 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M376 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M326 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M276 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M226 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M176 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M126 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M76 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />
              <path
                d="M26 0V600"
                className="path-black"
                stroke="black"
                strokeWidth={52}
              />

              <path
                d="M426 0V600"
                className="path-color"
                stroke="#FEE8D9"
                strokeWidth={48}
              />
              <path
                d="M376 0V600"
                className="path-color"
                stroke="#F489A3"
                strokeWidth={48}
              />
              <path
                d="M326 0V600"
                className="path-color"
                stroke="#F7B1B9"
                strokeWidth={48}
              />
              <path
                d="M276 0V600"
                className="path-color"
                stroke="#F489A3"
                strokeWidth={48}
              />
              <path
                d="M226 0V600"
                className="path-color"
                stroke="#FE0000"
                strokeWidth={48}
              />
              <path
                d="M176 0V600"
                className="path-color"
                stroke="#FEE8D9"
                strokeWidth={48}
              />
              <path
                d="M126 0V600"
                className="path-color"
                stroke="#F7B1B9"
                strokeWidth={48}
              />
              <path
                d="M76 0V600"
                className="path-color"
                stroke="#F489A3"
                strokeWidth={48}
              />
              <path
                d="M26 0V600"
                className="path-color"
                stroke="#FE0000"
                strokeWidth={48}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurProcess;
