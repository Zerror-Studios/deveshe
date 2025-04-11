import gsap from "gsap";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Hero = () => {
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".Vertical_wrapper",
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 1,
        snap: {
          snapTo: (progress) => {
            return Math.round(progress * 3) / 3; // 3 slides
          },
          duration: 0.5,
          ease: "power1.inOut",
        }
      },
      
    });
  
    // First transition (1 -> 2)
    tl.to(
      ".Vertical_wrapper_video_sec-1",
      {
        clipPath: `inset(0 0 100% 0)`,
      },
      "a"
    )
      .to(
        ".Vertical_wrapper_video_sec-1 img",
        {
          scale: 1.1,
        },
        "a"
      )
      .to(
        ".Vertical_wrapper_video_sec-2",
        {
          clipPath: `inset(0% 0 0 0)`,
        },
        "a-=0.2"
      )
      .to(
        ".Vertical_wrapper_video_sec-2 img",
        {
          scale: 1.1,
        },
        "a-=0.2"
      )
  
      // Second transition (2 -> 3)
      .to(
        ".Vertical_wrapper_video_sec-2",
        {
          clipPath: `inset(0 0 100% 0)`,
        },
        "b"
      )
      .to(
        ".Vertical_wrapper_video_sec-2 img",
        {
          scale: 1,
        },
        "b"
      )
      .to(
        ".Vertical_wrapper_video_sec-3",
        {
          clipPath: `inset(0% 0 0 0)`,
        },
        "b-=0.1"
      )
      .to(
        ".Vertical_wrapper_video_sec-3 img",
        {
          scale: 1.1,
        },
        "b-=0.1"
      )
  
      // Third transition (3 -> 4)
      .to(
        ".Vertical_wrapper_video_sec-3",
        {
          clipPath: `inset(0 0 100% 0)`,
        },
        "c"
      )
      .to(
        ".Vertical_wrapper_video_sec-3 img",
        {
          scale: 1,
        },
        "c"
      )
      .to(
        ".Vertical_wrapper_video_sec-4",
        {
          clipPath: `inset(0% 0 0 0)`,
        },
        "c-=0.1"
      )
      .to(
        ".Vertical_wrapper_video_sec-4 img",
        {
          scale: 1.1,
        },
        "c-=0.1"
      );
  });
  
  

  return (
    <>
      <div className="Vertical_wrapper">
        <div className="Vertical_wrapper_video_first_sec Vertical_wrapper_video_sec-1 Vertical_wrapper_video_sec_common">
          <img src="/archive/slide1.JPG" alt="" />
          <div className="overlay3a">
                    <div className="textContainer" id='textc1'>
                        <h4>Collection One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
        </div>
        <div className="Vertical_wrapper_video_sec Vertical_wrapper_video_sec-2 Vertical_wrapper_video_sec_common">
          <img src="/archive/slide2.JPG" alt="" />
          <div className="overlay3a">
                    <div className="textContainer" id='textc1'>
                        <h4>Collection One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
        </div>
        <div className="Vertical_wrapper_video_sec Vertical_wrapper_video_sec-3 Vertical_wrapper_video_sec_common">
          <img src="/archive/slide3.JPG" alt="" />
          <div className="overlay3a">
                    <div className="textContainer" id='textc1'>
                        <h4>Collection One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
        </div>
        <div className="Vertical_wrapper_video_sec Vertical_wrapper_video_sec-4 Vertical_wrapper_video_sec_common">
          <img src="/archive/slide1.JPG" alt="" />
          <div className="overlay3a">
                    <div className="textContainer" id='textc1'>
                        <h4>Collection One</h4>
                        <p>An homage to the neighbourhood Indian bookstore, where rich scents of aged books and fresh ink create a unique atmosphere. Infused with sandalwood, leather, tobacco, cardamom and delicate floral notes, this fragrance captures the charm of these analog havens.</p>
                    </div>
                </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
