import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import styles from "@/components/lookbook/Lookbook.module.css";

gsap.registerPlugin(ScrollTrigger);

const ChapterList = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#archiveSection3",
          end: `+=${data.length * 100}%`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      data.forEach((_, index) => {
        const elemSelector = `#elem${index + 1}`;
        const textSelector = `#textc${index + 1}`;

        // Animate out previous element
        if (index !== 0) {
          timeline.to(
            `#elem${index}`,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1.5,
              ease: "none",
            },
            `step${index}`
          );
        }

        // Animate in current element
        timeline.to(
          elemSelector,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "none",
          },
          `step${index}`
        );

        // Fade in corresponding text
        timeline.fromTo(
          textSelector,
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
          `step${index}+=1.2`
        );
      });

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
            className={`${styles.elem}`}
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
                <h4>{item?.title || ""}</h4>
                <p>{item?.description || ""}</p>
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
