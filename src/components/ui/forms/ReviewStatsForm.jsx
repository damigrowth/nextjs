"use client";

import { updateRating } from "@/lib/rating/update";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

export default function ReviewStatsForm({
  type,
  modelId,
  allReviewsRatings,
  ratings,
  reviewRatings,
  rating,
  rating_global,
  // ratingModelCount,  // -- Removed --
}) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const [formState, formAction] = useFormState(updateRating, initialState);

  const calculateAverageRating = (ratings) => {
    const totalRatings = ratings.reduce((acc, rating) => acc + rating, 0);
    return parseFloat((totalRatings / ratings.length).toFixed(2));
  };

  const averageRating = calculateAverageRating(reviewRatings);

  const sortRating = (averageRating) => {
    const sortedRatings = ratings.sort(
      (a, b) => b.attributes.grade - a.attributes.grade
    );

    for (const sortedRating of sortedRatings) {
      if (averageRating >= sortedRating.attributes.grade) {
        return sortedRating;
      }
    }
    return sortedRatings[sortedRatings.length - 1];
  };

  const [formData, setFormData] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    const sortedRating = sortRating(averageRating);

    if (rating !== averageRating || rating_global === null) {
      const newFormData = {
        type,
        modelId,
        averageRating,
        rating,
        rating_global: {
          id: Number(rating_global?.id) || null,
          grade: rating_global?.attributes?.grade || null,
          label: rating_global?.attributes?.label || null,
        },
        sortedRating: {
          id: Number(sortedRating.id),
          grade: sortedRating.attributes.grade,
          label: sortedRating.attributes.label,
        },
      };
      setFormData(newFormData);
    } else {
      setFormData(null);
    }
  }, [
    allReviewsRatings,
    ratings,
    reviewRatings,
    rating,
    rating_global,
    modelId,
  ]);

  useEffect(() => {
    if (formRef.current && formData) {
      handleSubmit();
    }
  }, [formData]);

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    try {
      await formAction(new FormData(formRef.current));
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const newRating = formState?.data?.newRating;
  // -- Removed --
  // const newRatingModelCount = formState?.data?.newRatingModelCount;
  const newGlobalRating = formState?.data?.newGlobalRating?.attributes?.label;

  // -- Removed --
  // const handleLabelModelCount = (count) => {
  //   if (type === "freelancer") {
  //     if (count > 1) {
  //       return count + " " + "Ελεύθεροι Επαγγελματίες";
  //     } else {
  //       return count + " " + "Ελεύθερος Επαγγελματίας";
  //     }
  //   } else if (type === "service") {
  //     if (count > 1) {
  //       return count + " " + "Υπηρεσίες";
  //     } else {
  //       return count + " " + "Υπηρεσία";
  //     }
  //   } else if (type === "employer") {
  //     if (count > 1) {
  //       return count + " " + "Εργοδότες";
  //     } else {
  //       return count + " " + "Εργοδότης";
  //     }
  //   } else {
  //     return "";
  //   }
  // };

  return (
    <form action={formAction} ref={formRef} className="wrapper mx-auto">
      <div className="t-review mb15">{rating}</div>
      {/* <div className="t-review mb15">{averageRating}</div> */}
      <h5>
        {rating_global?.attributes
          ? rating_global.attributes.label
          : newGlobalRating}
      </h5>
      {/* <p className="fz14 mb-0">
        {handleLabelModelCount(ratingModelCount || newRatingModelCount)}
      </p> */}
      <input
        type="text"
        id="rating"
        name="rating"
        hidden
        readOnly
        value={JSON.stringify(formData)}
      />
    </form>
  );
}
