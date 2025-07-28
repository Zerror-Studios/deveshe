import { htmlParser } from "@/utils/Util";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React from "react";
gsap.registerPlugin(ScrollTrigger);
const Section1 = ({ title, subheading, description, asset }) => {
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#lookbook-Sec1",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
    tl.to("#lookbook-Sec1 .lb-header-image img", { scale: 1.2, duration: 1 });
  }, []);

  return (
    <>
      <div id="lookbook-Sec1">
        <div className="lb-header-wrapper">
          <div className="lb-header">
            <div className="lb-header-text">
              <h2>{title || ""}</h2>
              <p>{subheading || ""}</p>
            </div>
          </div>
        </div>
        <div className="lb-header-image">
          <Image
            width={1000}
            height={1000}
            src={asset?.path || ""}
            alt={asset?.altText || ""}
          />
        </div>
      </div>
      {description && (
        <div id="lb-text-container">
          {htmlParser(description || "")}
        </div>
      )}
    </>
  );
};

export default Section1;
