import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";
gsap.registerPlugin(ScrollTrigger);
const ReviewSection = () => {
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

    splitText(".review_title");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#review_section",
          start: "top 30%",
          end: "top 0%",
          // scrub: true,
          // markers: true,
        },
      });

      tl.fromTo(
        ".review_title span",
        { rotateX: "90deg" },
        {
          duration: 0.8,
          rotateX: "0deg",
          stagger: 0.05,
          ease: "bounce.out",
        }
      );

      // Refresh in case layout/images/fonts shift anything
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => ctx.revert();
  }, []);
  const reviews = [
    {
      id: 1,
      name: "Sachi Bhansali",
      handle: "@sachibhansali",
      avatar: "/assets/images/home/home_banner.webp", // replace with actual image if any
      content:
        "I love the blue ombré top I got! It’s so comfortable and fits so well! I love the silver detailing on the sleeves too, just the right amount of accent needed to elevate the top!",
      time: "1:21 PM",
      date: "Aug 26, 2025",
      tag: "De Ve She Dreams",
    },
    {
      id: 2,
      name: "Nami Shah",
      handle: "@namishah",
      avatar: "/assets/images/home/home_banner.webp",
      content:
        "The designs for each piece feel thoughtful and unique while maintaining consistent quality. Great statement pieces to add to any wardrobe!",
      time: "1:21 PM",
      date: "Aug 26, 2025",
      tag: "De Ve She Dreams",
    },
    {
      id: 3,
      name: "Vrishali Pispati",
      handle: "@vrishalipispati",
      avatar: "/assets/images/home/home_banner.webp",
      content:
        "I bought this printed poplin shirt for my son and he absolutely loves it. It’s comfortable and looks great on him.",
      time: "1:21 PM",
      date: "Aug 26, 2025",
      tag: "De Ve She Dreams",
    },
    {
      id: 4,
      name: "Aruja Kothari",
      handle: "@arujakothari",
      avatar: "/assets/images/home/home_banner.webp",
      content:
        "The collection at De Ve She Dreams is super versatile! Love the way they use motifs along with abstract patterns. The fabric is so comfortable and you can easily style the pieces up or down! 100% recommended 😍",
      time: "1:21 PM",
      date: "Aug 26, 2025",
      tag: "De Ve She Dreams",
    },
    {
      id: 5,
      name: "Vedika Jhunjhunwala",
      handle: "@vedikajhunjhunwala",
      avatar: "/assets/images/home/home_banner.webp",
      content:
        "I love how every outfit from this brand feels like it has a story behind it. The fabrics are amazing and the quality really shows that a lot of thought goes into every detail. It’s the kind of clothing you want to keep forever",
      time: "1:21 PM",
      date: "Aug 26, 2025",
      tag: "De Ve She Dreams",
    },
  ];
  return (
    <div id="review_section">
      <div className="review_title_slide">
        <h2 className="review_title review_title_large">Happy customers</h2>
      </div>
      {reviews.map((review, i) => (
        <div key={review.id} className="review_slide">
          {i === 0 && (
            <h2 className="review_title review_title_mobile">
              Happy customers
            </h2>
          )}

          <div className="review_card">
            <div className="tweet-card" role="article" aria-label="Tweet card">
              {/* Header */}
              <div className="tweet-header">
                <Image
                  width={1000}
                  height={1000}
                  className="avatar"
                  src={review.avatar}
                  alt={review.name}
                />
                <div className="author">
                  <div className="name">{review.name}</div>
                  {review.handle && (
                    <div className="handle">{review.handle}</div>
                  )}
                </div>

                <div className="bird" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path d="M23 4.8c-.8.4-1.7.6-2.6.8.9-.6 1.6-1.4 2-2.5-.9.5-1.9.9-3 .1-1-1-2.7-1-3.7 0-1 .9-1.3 2.3-.8 3.5-3.4-.2-6.6-1.8-8.7-4.5-1.1 2-.6 4.6 1.3 6-.7 0-1.4-.2-2-.5v.1c0 2.2 1.6 4.1 3.8 4.6-.7.2-1.4.2-2.1.1.6 1.9 2.3 3.2 4.3 3.2-1.6 1.3-3.7 2.1-5.9 2.1H2c2.1 1.4 4.6 2.1 7.1 2.1 8.5 0 13.2-7.1 13.2-13.2v-.6c.9-.6 1.6-1.4 2.2-2.3z" />
                  </svg>
                </div>
              </div>

              {/* Body */}
              <p className="tweet-body">{review.content}</p>

              {/* Footer */}
              {review.time && review.date && (
                <div className="tweet-footer">
                  <span>{review.time}</span>
                  <span>·</span>
                  <span>{review.date}</span>
                  {review.tag && (
                    <>
                      <span>·</span>
                      <a href="#" className="tag">
                        {review.tag}
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewSection;
