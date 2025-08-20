import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";
import { htmlParser } from "@/utils/Util";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ChapterList = ({ data = [] }) => {
  useGSAP(() => {
    if (!data || data.length <= 1) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#lookbook_list",
          start: "top top",
          end: `+=${(data.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < data.length; i++) {
        const elemId = `#chapter_cover${i + 1}`;

        if (i === 0) {
          // Skip "animate in" for the first one, since it's already visible
        } else {
          timeline.to(
            elemId,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1.5,
              ease: "none",
            },
            `label${i}`
          );
        }

        if (i < data.length - 1) {
          timeline.to(
            elemId,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1.5,
              ease: "none",
            },
            `label${i + 1}`
          );
        }
      }

      // Refresh after short delay to ensure layout is updated
      setTimeout(() => ScrollTrigger.refresh(), 200);
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [data]);

  return (
    <div id="lookbook_list" className="chapters">
      {data.map((item, index) => (
        <Link
          href={`/lookbook/${item._id}`}
          className={`chapter_cover`}
          id={`chapter_cover${index + 1}`}
          key={item._id}
        >
          <Image
            width={1000}
            height={1000}
            src={item?.assets?.[0]?.path || "/archive/lookbook1.jpg"}
            alt={item?.assets?.[0]?.altText || ""}
            onLoad={() => ScrollTrigger.refresh()}
          />
          <div className="chapter_overlay">
            <div className="chapter_details" id={`textc${index + 1}`}>
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

// <div className={styles.archiveWrapper}>
//   <div id="archiveSection3" className={styles.archiveSection3}>
//     {data.map((item, index) => (
//       <Link
//         href={`/lookbook/${item._id}`}
//         className={`${styles.elem} ${styles.elem1}`}
//         id={`elem${index + 1}`}
//         key={item._id}
//       >
//         <Image
//           width={1000}
//           height={1000}
//           src={item?.assets?.[0]?.path || "/archive/lookbook1.jpg"}
//           alt={item?.assets?.[0]?.altText || ""}
//         />
//         <div className={styles.overlay3a}>
//           <div className={styles.textContainer} id={`textc${index + 1}`}>
//             <h3>{item?.subName || ""}</h3>
//             <h4>{item?.name || ""}</h4>
//             {item?.description && (
//               <>{htmlParser(item?.description || "")}</>
//             )}
//             <span className={styles.exploreBtn}>
//               Explore <FiArrowUpRight />
//             </span>
//           </div>
//         </div>
//       </Link>
//     ))}
//   </div>
// </div>
