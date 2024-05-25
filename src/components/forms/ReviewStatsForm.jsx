"use client";

import { updateRating } from "@/lib/rating/update";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

export default function ReviewStatsForm({
  reviews,
  ratings,
  reviewRatings,
  serviceRating,
  serviceRatingGlobal,
  ratingServicesCount,
}) {
  const initialState = {
    data: null,
    errors: {},
    message: null,
  };

  const params = useParams();
  const serviceId = params.id;

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

    for (const rating of sortedRatings) {
      if (averageRating >= rating.attributes.grade) {
        return rating;
      }
    }
    return sortedRatings[sortedRatings.length - 1];
  };

  const [formData, setFormData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const sortedRating = sortRating(averageRating);

    if (serviceRating !== averageRating) {
      setFormData({
        serviceId,
        averageRating,
        serviceRating,
        serviceRatingGlobal: {
          id: serviceRatingGlobal.id,
          grade: serviceRatingGlobal.attributes.grade,
          name: serviceRatingGlobal.attributes.name,
        },
        sortedRating: {
          id: sortedRating.id,
          grade: sortedRating.attributes.grade,
          name: sortedRating.attributes.name,
        },
      });
    } else {
      setFormData(null);
    }
  }, [
    reviews,
    ratings,
    reviewRatings,
    serviceRating,
    serviceRatingGlobal,
    serviceId,
  ]);

  useEffect(() => {
    if (formRef.current && formData) {
      formRef.current.submit();
    }
  }, [formData]);

  return (
    <form action={formAction} ref={formRef} className="wrapper mx-auto">
      <div className="t-review mb15">{averageRating}</div>
      <h5>{serviceRatingGlobal.attributes.name}</h5>
      <p className="text mb-0">
        {ratingServicesCount}{" "}
        {ratingServicesCount > 1 ? "Υπηρεσίες" : "Υπηρεσία"}
      </p>
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
