/**
 * Star picker (PRD-032 FR-D2)
 *
 * Five radio inputs in a fieldset, so keyboards (arrow keys) and screen
 * readers ("4 out of 5 stars") work without custom handling; the stars are
 * the labels' decoration.
 */

import React, { useId } from "react";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { MAX_RATING } from "@/utils/review.util";

const StarRatingInput = ({ value = 0, onChange, error, legend = "Your rating" }) => {
  const name = useId();
  return (
    <fieldset className="review_star_input" aria-invalid={error ? "true" : undefined}>
      <legend>{legend}</legend>
      <div className="review_star_input_row">
        {[...Array(MAX_RATING)].map((_, index) => {
          const stars = index + 1;
          const id = `${name}-${stars}`;
          return (
            <span key={stars} className="review_star_option">
              <input
                type="radio"
                id={id}
                name={name}
                value={stars}
                checked={value === stars}
                onChange={() => onChange(stars)}
                aria-label={`${stars} out of ${MAX_RATING} stars`}
              />
              <label htmlFor={id} aria-hidden="true">
                {stars <= value ? <FaStar size={22} /> : <FaRegStar size={22} />}
              </label>
            </span>
          );
        })}
      </div>
      {error && <p className="review_field_error">{error}</p>}
    </fieldset>
  );
};

export default StarRatingInput;
