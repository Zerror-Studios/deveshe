/**
 * A signed-in shopper's review of one product (PRD-032 FR-D2)
 *
 * Creates or edits the shopper's one review of the product
 * (`submitReview`; the server decides the status). Field errors come back
 * on their inputs (`INVALID_REVIEW_FIELD` + `field`); other refusals by
 * reason. Used on the product page and in the account area.
 */

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { SUBMIT_REVIEW } from "@/graphql";
import CommonButton from "@/components/common/CommonButton";
import ReviewFields from "./ReviewFields";
import {
  reviewErrorFeedback,
  reviewFormProblem,
  submittedMessage,
  toReviewFormValue,
  toSubmitReviewInput,
} from "@/utils/review.util";

const ReviewForm = ({
  productId,
  initialReview = null,
  photosEnabled = false,
  onSaved,
  onCancel,
}) => {
  const [value, setValue] = useState(() => toReviewFormValue(initialReview));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitReview, { loading }] = useMutation(SUBMIT_REVIEW);
  const idPrefix = `review-${productId}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isUploading) return;
    setMessage("");
    const problem = reviewFormProblem(value);
    if (problem) {
      setErrors({ [problem.field]: problem.message });
      return;
    }
    setErrors({});
    try {
      const { data } = await submitReview({
        variables: { input: toSubmitReviewInput(productId, value) },
      });
      onSaved?.(data?.submitReview, submittedMessage(data?.submitReview?.status));
    } catch (error) {
      const feedback = reviewErrorFeedback(error);
      if (feedback.field) setErrors({ [feedback.field]: feedback.message });
      else setMessage(feedback.message);
    }
  };

  return (
    <form className="review_form" onSubmit={handleSubmit} noValidate>
      <ReviewFields
        idPrefix={idPrefix}
        value={value}
        onChange={setValue}
        errors={errors}
        photosEnabled={photosEnabled}
        disabled={loading}
        onUploadingChange={setIsUploading}
      />
      {message && <p className="review_field_error" role="alert">{message}</p>}
      <div className="review_form_actions">
        <CommonButton
          title={initialReview ? "Save review" : "Submit review"}
          type="submit"
          loading={loading || isUploading}
        />
        {onCancel && (
          <button type="button" className="review_link_btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
