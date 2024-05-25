"use client";

import { createServiceReview } from "@/lib/review/create";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import ReactStars from "react-stars";
import TextArea from "../inputs/TextArea";
import ReviewSuccess from "../dashboard/section/ReviewSuccess/ReviewSuccess";

function AddServiceReviewButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="ud-btn btn-dark default-box-shadow2">
      {pending ? "Αποστολή Κριτικής..." : "Αποστολή Κριτικής"}
      {pending ? (
        <div className="spinner-border spinner-border-sm ml10" role="status">
          <span className="sr-only"></span>
        </div>
      ) : (
        <span className="pl10">💬</span>
      )}
    </button>
  );
}

function ReviewCommentInput({ formState, formData, handleCommentChange }) {
  const { pending } = useFormStatus();
  return (
    <TextArea
      label=""
      minLength={25}
      maxLength={350}
      counter
      disabled={pending}
      errors={formState?.errors}
      value={formData.comment}
      defaultValue={formData.comment}
      onChange={(formattedValue) => handleCommentChange(formattedValue)}
      formatSymbols
      capitalize
    />
  );
}

export default function AddServiceReviewForm({ serviceId }) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction] = useFormState(
    createServiceReview,
    initialState
  );

  const [formData, setFormData] = useState({
    rating: 1,
    comment: "",
    serviceId,
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

  const reviewId = formState?.data?.id;

  return (
    <>
      {reviewId ? (
        <ReviewSuccess id={reviewId} />
      ) : (
        <div className="bsp_reveiw_wrt mb20">
          <h6 className="fz17">Πρόσθεσε Κριτική</h6>
          <p className="text">
            Το email σας δεν θα δημοσιευτεί, μόνο το όνομα και το επίθετο.
          </p>
          <h6>Βαθμολογία</h6>
          <ReactStars
            count={5}
            value={formData.rating}
            half={false}
            onChange={handleRatingChange}
            size={24}
            color2={"#5bbb7b"}
          />

          <form action={formAction} className="comments_form mt30 mb30-md">
            <input
              type="text"
              name="newReviewData"
              id="newReviewData"
              hidden
              readOnly
              value={JSON.stringify(formData)}
            />
            <div className="row">
              <div className="col-md-12">
                <div className="mb-4">
                  <label className="fw500 fz16 ff-heading dark-color mb-2">
                    Κριτική
                  </label>
                  <ReviewCommentInput
                    formState={formState}
                    formData={formData}
                    handleCommentChange={handleCommentChange}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <AddServiceReviewButton />
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
