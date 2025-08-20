import React, { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import { htmlParser } from "@/utils/Util";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ChapterList = ({ data = [] }) => {
  const containerRef = useRef(null); 

  useGSAP(
    () => {
      if (!data || data.length <= 1) return;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current, 
          start: "top top",
          end: `+=${(data.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const covers = containerRef.current.querySelectorAll(".chapter_cover");

      covers.forEach((cover, i) => {
        // Animate in
        timeline.to(
          cover,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "none",
          },
          `label${i}`
        );

        // Animate out if not the last one
        if (i < covers.length - 1) {
          timeline.to(
            cover,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1.5,
              ease: "none",
            },
            `label${i + 1}`
          );
        }
      });

      // Refresh after all images load
      const handleLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", handleLoad);

      return () => {
        window.removeEventListener("load", handleLoad);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef, dependencies: [data] } 
  );

  return (
    <div id="lookbook_list" ref={containerRef}>
      {data.map((item, index) => (
        <Link
          href={`/lookbook/${item._id}`}
          className="chapter_cover"
          key={item._id}
        >
          <Image
            width={1000}
            height={1000}
            src={item?.assets?.[0]?.path || "/archive/lookbook1.jpg"}
            alt={item?.assets?.[0]?.altText || ""}
            onLoad={() => ScrollTrigger.refresh()} // extra safety
          />
          <div className="chapter_overlay">
            <div className="chapter_details">
              <h3>{item?.subName || ""}</h3>
              <h4>{item?.name || ""}</h4>
              {item?.description && <>{htmlParser(item?.description || "")}</>}
              <span className="exploreBtn">
                Explore <FiArrowUpRight />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ChapterList;
