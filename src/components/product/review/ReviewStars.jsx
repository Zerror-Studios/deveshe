/**
 * Read-only stars (PRD-032). One accessible label for the whole row; the
 * icons are decorative.
 */

import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { MAX_RATING, clampRating } from "@/utils/review.util";

const ReviewStars = ({ rating, size = 14, label }) => {
  const value = clampRating(rating);
  return (
    <span
      className="review_stars"
      role="img"
      aria-label={label || `Rated ${value} out of ${MAX_RATING}`}
    >
      {[...Array(MAX_RATING)].map((_, index) =>
        index < value ? (
          <FaStar key={index} size={size} aria-hidden="true" />
        ) : (
          <FaRegStar key={index} size={size} aria-hidden="true" />
        ),
      )}
    </span>
  );
};

export default ReviewStars;
