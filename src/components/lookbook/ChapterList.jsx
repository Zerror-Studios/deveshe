import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import styles from "@/components/lookbook/Lookbook.module.css";
import { htmlParser } from "@/utils/Util";

gsap.registerPlugin(ScrollTrigger);

const ChapterList = ({ data = [] }) => {
  useEffect(() => {
    if (!data || data.length <= 1) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#archiveSection3",
          start: "top top",
          end: `+=${(data.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let index = 1; index < data.length; index++) {
        const currentElem = `#elem${index + 1}`;
        const currentText = `#textc${index + 1}`;
        const previousElem = `#elem${index}`;

        // Reveal current element
        timeline.to(
          currentElem,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "none",
          },
          `${index}`
        );

        // Animate current text
        timeline.fromTo(
          currentText,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "none",
          },
          `${index}`
        );

        // Hide previous element **after**
        timeline.to(
          previousElem,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.5,
            ease: "none",
          },
          `${index + 0.01}` // small delay to run after reveal
        );
      }

      setTimeout(() => ScrollTrigger.refresh(), 200);
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [data]);

  return (
    <div className={styles.archiveWrapper}>
      <div id="archiveSection3" className={styles.archiveSection3}>
        {data.map((item, index) => (
          <Link
            href={`/lookbook/${item._id}`}
            className={`${styles.elem} ${styles.elem1}`}
            id={`elem${index + 1}`}
            key={item._id}
          >
            <Image
              width={1000}
              height={1000}
              src={item?.assets?.[0]?.path || "/archive/lookbook1.jpg"}
              alt={item?.assets?.[0]?.altText || ""}
            />
            <div className={styles.overlay3a}>
              <div className={styles.textContainer} id={`textc${index + 1}`}>
                <h3>{item?.subName || ""}</h3>
                <h4>{item?.name || ""}</h4>
                {item?.description && (
                  <>{htmlParser(item?.description || "")}</>
                )}
                <span className={styles.exploreBtn}>
                  Explore <FiArrowUpRight />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
