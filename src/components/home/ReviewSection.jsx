import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import React, { useEffect } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa6";
gsap.registerPlugin(ScrollTrigger);

// Ratings are out of five (ReviewInput.rating).
const MAX_RATING = 5;

const formatReviewDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// PRD-014 FR-0.9 (UX-35): only real, APPROVED reviews (`getReviews`, read on
// the server in pages/index.jsx; PRD-032 FR-D6: the store's pinned ones
// first). Each shows the reviewer's display name ("Priya S."), never the
// account; with no approved review the section is not rendered.
const ReviewSection = ({ reviews = [] }) => {
  const hasReviews = reviews.length > 0;

  useEffect(() => {
    if (!hasReviews) return;

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
  }, [hasReviews]);

  if (!hasReviews) return null;

  return (
    <div id="review_section">
      <div className="review_title_slide">
        <h2 className="review_title review_title_large">Happy customers</h2>
      </div>
      {reviews.map((review, i) => {
        const rating = Math.min(Math.max(review.rating || 0, 0), MAX_RATING);
        const date = formatReviewDate(review.createdAt);
        return (
          <div key={review._id} className="review_slide">
            {i === 0 && (
              <h2 className="review_title review_title_mobile">
                Happy customers
              </h2>
            )}

            <div className="review_card">
              <div className="tweet-card" role="article">
                {/* Header */}
                <div className="tweet-header">
                  <Image
                    width={1000}
                    height={1000}
                    className="avatar"
                    src="/placeholder/avatar-female.jpg"
                    alt=""
                  />
                  <div className="author">
                    <div className="name">{review.displayName || "Customer review"}</div>
                    <span
                      role="img"
                      aria-label={`Rated ${rating} out of ${MAX_RATING}`}
                    >
                      {[...Array(MAX_RATING)].map((_, index) => (
                        <FaStar
                          key={index}
                          aria-hidden="true"
                          className={`${index < rating ? "" : "rating-star"} rating-s`}
                        />
                      ))}
                    </span>
                  </div>

                  <div className="bird" aria-hidden="true">
                    <Image
                      width={1000}
                      height={1218}
                      src="/scrapbook/letter.png"
                      alt=""
                    />
                  </div>
                </div>

                {/* Body */}
                <p className="tweet-body">{review.comment}</p>

                {/* Footer */}
                {(date || review.product?.slug) && (
                  <div className="tweet-footer">
                    {date && <span>{date}</span>}
                    {date && review.product?.slug && <span>·</span>}
                    {review.product?.slug && (
                      <Link
                        href={`/product/${review.product.slug}`}
                        className="tag"
                      >
                        {review.product.name}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewSection;
