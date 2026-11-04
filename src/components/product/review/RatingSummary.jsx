/**
 * Rating summary (PRD-032 FR-D1)
 *
 * Average, count and the 5★…1★ bars from `Product.reviewSummary` (approved
 * reviews only). Each bar is a button that filters the list by that star
 * rating; pressing the active one clears the filter.
 */

import React from "react";
import ReviewStars from "./ReviewStars";
import {
  distributionRows,
  formatAverage,
  reviewCountLabel,
} from "@/utils/review.util";

const RatingSummary = ({ summary, activeRating, onSelectRating }) => {
  if (!summary?.reviewCount) return null;
  const average = formatAverage(summary);
  return (
    <div className="review_summary">
      <div className="review_summary_score">
        <p className="review_summary_average">{average}</p>
        <ReviewStars
          rating={summary.averageRating}
          size={18}
          label={`Average rating ${average} out of 5`}
        />
        <p className="review_summary_count">{reviewCountLabel(summary.reviewCount)}</p>
      </div>
      <ul className="review_summary_bars">
        {distributionRows(summary).map((row) => (
          <li key={row.stars}>
            <button
              type="button"
              className={`review_summary_bar ${activeRating === row.stars ? "is_active" : ""}`}
              onClick={() => onSelectRating(activeRating === row.stars ? null : row.stars)}
              aria-pressed={activeRating === row.stars}
              aria-label={`${row.stars} stars: ${row.count} ${row.count === 1 ? "review" : "reviews"}`}
              disabled={row.count === 0}
            >
              <span className="review_summary_bar_label" aria-hidden="true">{`${row.stars}★`}</span>
              <span className="review_summary_bar_track" aria-hidden="true">
                <span style={{ width: `${row.percent}%` }} />
              </span>
              <span className="review_summary_bar_count" aria-hidden="true">{row.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RatingSummary;
