"use client";

import { createModelReview } from "@/lib/review/create";
import { useState } from "react";
import { useActionState } from "react";
import TextArea from "../../inputs/TextArea";
import ReviewSuccess from "../Reviews/ReviewSuccess";
import Rating from "../rating/Rating";

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

  // Using useActionState instead of useFormState
  const [state, action, pending] = useActionState(createModelReview, {
    data: null,
    errors: {},
    message: null,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await action(formData);
  };

  const reviewId = state?.data?.id;

  return (
    <>
      {reviewId ? (
        <ReviewSuccess id={reviewId} />
      ) : (
        <div className="bsp_reveiw_wrt mb20">
          <h6 className="fz17">Πρόσθεσε Αξιολόγηση</h6>
          <p className="text">
            Θα πρέπει να έχετε λάβει κάποια υπηρεσία για να βάλετε βαθμολογία.
          </p>
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

          <form onSubmit={handleSubmit} className="comments_form mt30 mb30-md">
            <div className="row">
              <div className="col-md-12">
                <div className="mb-4">
                  <label className="fw500 fz16 ff-heading dark-color mb-2">
                    Αξιολόγηση
                  </label>
                  <TextArea
                    label=""
                    id="comment"
                    name="comment"
                    minLength={25}
                    maxLength={350}
                    counter
                    disabled={pending}
                    errors={state?.errors}
                    value={formData.comment}
                    defaultValue={formData.comment}
                    onChange={(formattedValue) =>
                      handleCommentChange(formattedValue)
                    }
                    capitalize
                  />
                </div>
              </div>

              <div className="col-md-12">
                <button
                  disabled={pending}
                  className="ud-btn btn-dark default-box-shadow2"
                >
                  {pending ? "Αποστολή Αξιολόγησης..." : "Αποστολή Αξιολόγησης"}
                  {pending ? (
                    <div
                      className="spinner-border spinner-border-sm ml10"
                      role="status"
                    >
                      <span className="sr-only"></span>
                    </div>
                  ) : (
                    <span className="pl10">💬</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
