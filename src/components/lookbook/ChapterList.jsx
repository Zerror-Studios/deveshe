import React, { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import styles from "@/components/lookbook/Lookbook.module.css";
import { htmlParser } from "@/utils/Util";

gsap.registerPlugin(ScrollTrigger);

const ChapterList = ({ data = [] }) => {
  useEffect(() => {
    if (!data) return;

    const cursor = document.querySelector(`.${styles.cursorlookbook}`);
    const wrapper = document.querySelector(`.${styles.lookbookWrapper}`);
    const cursorInner = cursor.querySelector(`.${styles.cursorInner}`);

    let mouseX = 0;
    let mouseY = 0;
    let prevX = 0;
    let prevY = 0;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(cursor, {
        opacity: 1,
        width: "70px",
        height: "70px",
        duration: 0.2,
        color: "black",
        ease: "power3.out",
      });
    };

    const leaveCursor = () => {
      gsap.to(cursor, {
        opacity: 0,
        width: 0,
        height: 0,
        color: "white",
        duration: 0.2,
        ease: "power3.out",
      });
    };

    const render = () => {
      const dx = mouseX - prevX;
      const dy = mouseY - prevY;

      prevX += dx * 0.2;
      prevY += dy * 0.2;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.15, 10);

      gsap.set(cursor, {
        left: prevX,
        top: prevY,
        scaleX: 1 + dist / 60,
        scaleY: 1 - dist / 50,
        transformOrigin: "center",
      });

      if (cursorInner) {
        gsap.set(cursorInner, { rotation: -angle });
      }

      requestAnimationFrame(render);
    };

    // 👉 attach listeners only to wrapper
    wrapper.addEventListener("mousemove", moveCursor);
    wrapper.addEventListener("mouseleave", leaveCursor);

    render();

    return () => {
      wrapper.removeEventListener("mousemove", moveCursor);
      wrapper.removeEventListener("mouseleave", leaveCursor);
    };
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#lookbookList",
          start: "top top",
          end: `+=${(data.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < data.length; i++) {
        const elemId = `#elem${i + 1}`;

        if (i > 0) {
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

      setTimeout(() => ScrollTrigger.refresh(), 200);
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [data]);

  return (
    <div className={styles.lookbookWrapper}>
      <div className={styles.cursorlookbook}>Explore</div>
      <div id="lookbookList" className={styles.lookbookList}>
        {data.map((item, index) => (
          <Link
            href={`/lookbook/${item._id}`}
            className={`${styles.elem} ${styles.elem1} skeleton-loading`}
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
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
