"use client";

import { createModelReview } from "@/lib/review/create";
import { useActionState, useState } from "react";
import ReviewSuccess from "../Reviews/ReviewSuccess";
import Rating from "../rating/Rating";
import TextArea from "@/components/inputs/TextArea";
import Alert from "../alerts/Alert";
import SaveButton from "../buttons/SaveButton";

export default function AddModelReviewForm({
  modelType,
  tenantType,
  modelId,
  tenantId,
}) {
  const initialFormData = {
    rating: 1,
    comment: "",
    modelType,
    tenantType,
    modelId,
    tenantId,
  };

  const [formData, setFormData] = useState(initialFormData);

  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  // Using useActionState instead of useFormState
  const [formState, formAction, isPending] = useActionState(
    createModelReview,
    initialState
  );

  const handleRatingChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rating: value,
    }));
  };

  const handleCommentChange = (text) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      comment: text,
    }));
  };

  const handleSubmit = (formDataObj) => {
    const reviewData = new FormData();
    reviewData.append("newReviewData", JSON.stringify(formData));
    return formAction(reviewData);
  };

  const reviewId = formState?.data?.id;

  // Check if form has changes compared to initial state
  const hasChanges =
    formData.rating !== initialFormData.rating ||
    formData.comment !== initialFormData.comment;

  return (
    <>
      {reviewId ? (
        <ReviewSuccess id={reviewId} />
      ) : (
        <div className="bsp_reveiw_wrt mb20">
          <form action={handleSubmit} className="comments_form mt30 mb30-md">
            <h6 className="fz17">Πρόσθεσε Αξιολόγηση</h6>
            <p className="text">
              Θα πρέπει να έχετε λάβει κάποια υπηρεσία για να βάλετε βαθμολογία.
            </p>
            <div className="mb10">
              <h6>Βαθμολογία</h6>
              <Rating
                count={5}
                value={formData.rating}
                half={false}
                onChange={handleRatingChange}
                size={24}
                color1={"#6b7177"}
                color2={"#e1c03f"}
              />
              {formState?.errors?.rating && (
                <div className="text-danger small mt-1">
                  {formState.errors.rating}
                </div>
              )}
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="mb-4">
                  <TextArea
                    label="Αξιολόγηση"
                    id="comment"
                    name="comment"
                    minLength={25}
                    maxLength={350}
                    counter
                    disabled={isPending}
                    errors={formState?.errors?.comment}
                    value={formData.comment}
                    defaultValue={formData.comment}
                    onChange={(formattedValue) =>
                      handleCommentChange(formattedValue)
                    }
                    capitalize
                  />
                </div>
              </div>

              {formState?.errors && formState.errors.submit && (
                <div className="col-md-12">
                  <Alert
                    type="error"
                    message={formState.errors.submit}
                    className="mt-3"
                  />
                </div>
              )}

              {formState?.message && !formState?.errors?.submit && (
                <div className="col-md-12">
                  <Alert
                    type="success"
                    message={formState.message}
                    className="mt-3"
                  />
                </div>
              )}

              <SaveButton
                isPending={isPending}
                icon="fa-solid fa-paper-plane"
                defaultText="Αποστολή Αξιολόγησης"
                hasChanges={hasChanges}
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
