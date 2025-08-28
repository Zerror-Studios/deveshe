import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";
import { FaStar } from "react-icons/fa6";
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
      avatar: "/placeholder/avatar-female.jpg", // replace with actual image if any
      content:
        "I love the blue ombré top I got! It’s so comfortable and fits so well! I love the silver detailing on the sleeves too, just the right amount of accent needed to elevate the top!",
      time: "11:42 AM",
      date: "Feb 12, 2025",
      tag: "De Ve She Dreams",
      rating: 5,
    },
    {
      id: 2,
      name: "Nami Shah",
      avatar: "/placeholder/avatar-female.jpg",
      content:
        "The designs for each piece feel thoughtful and unique while maintaining consistent quality. Great statement pieces to add to any wardrobe!",
      time: "3:15 PM",
      date: "Mar 28, 2025",
      tag: "De Ve She Dreams",
      rating: 4,
    },
    {
      id: 3,
      name: "Vrishali Pispati",
      avatar: "/placeholder/avatar-female.jpg",
      content:
        "I bought this printed poplin shirt for my son and he absolutely loves it. It’s comfortable and looks great on him.",
      time: "9:05 AM",
      date: "May 09, 2025",
      tag: "De Ve She Dreams",
      rating: 4,
    },
    {
      id: 4,
      name: "Aruja Kothari",
      avatar: "/placeholder/avatar-female.jpg",
      content:
        "The collection at De Ve She Dreams is super versatile! Love the way they use motifs along with abstract patterns. The fabric is so comfortable and you can easily style the pieces up or down! 100% recommended 😍",
      time: "6:48 PM",
      date: "Jun 14, 2025",
      tag: "De Ve She Dreams",
      rating: 5,
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
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`${index < review.rating ? '':'rating-star'} rating-s`}
                    />
                  ))}
                </div>

                <div className="bird" aria-hidden="true">
                   <Image
                  width={1000}
                  height={1000}
                  src='/scrapbook/letter.png'
                  alt={review.name}
                />
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
