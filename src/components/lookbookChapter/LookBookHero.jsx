import { htmlParser } from "@/utils/Util";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";

gsap.registerPlugin(ScrollTrigger);

const splitText = (element) => {
  if (!element || element.dataset.split) return;
  const letters = element.textContent
    .split("")
    .map((char) =>
      char === " " ? `<span>&nbsp;</span>` : `<span>${char}</span>`
    );
  element.innerHTML = letters.join("");
  element.dataset.split = "true";
};

const LookBookHero = ({ title, subheading, description, asset }) => {
  const router = useRouter();

  const sectionRef = useRef(null);
  const headerImageRef = useRef(null);
  const h2Ref = useRef(null);
  const pRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      splitText(h2Ref.current);

      gsap.set(headerImageRef.current, { y: "-58vh" });
      gsap.set(h2Ref.current.querySelectorAll("span"), { rotateX: "90deg" });
      gsap.set(pRef.current, { opacity: 0 });

      const texttl = gsap.timeline();
      texttl
        .to(headerImageRef.current, {
          y: 0,
          duration: 1,
          delay: 1,
          ease: "power4.out",
        })
        .to(h2Ref.current.querySelectorAll("span"), {
          rotateX: "0deg",
          duration: 0.8,
          stagger: 0.05,
          ease: "bounce.out",
        })
        .to(pRef.current, {
          opacity: 1,
          duration: 0.6,
          ease: "power1.out",
        });

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      }).to(imgRef.current, {
        scale: 1.2,
        duration: 1,
        ease: "none",
      });
    }, sectionRef);

    return () => ctx.revert(); // cleanup
  }, [title, router.asPath]); // 🔁 rerun when title or route changes

  return (
    <>
      <div id="lookbook-Sec1" ref={sectionRef}>
        <div className="lb-header-wrapper">
          <div className="lb-header">
            <div className="lb-header-text">
              <h2 ref={h2Ref}>{title || ""}</h2>
              <p ref={pRef}>{subheading || ""}</p>
            </div>
          </div>
        </div>
        <div className="lb-header-image" ref={headerImageRef}>
          <Image
            ref={imgRef}
            width={1000}
            height={1000}
            src={asset?.path || ""}
            alt={asset?.altText || ""}
          />
        </div>
      </div>
      {description && (
        <div id="lb-text-container">{htmlParser(description)}</div>
      )}
    </>
  );
};

export default LookBookHero;
