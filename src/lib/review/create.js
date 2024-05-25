"use server";

import { z } from "zod";
import { postData, putData } from "../api";
import { POST_REVIEW } from "../queries";
import { getUserId } from "../user/user";

const reviewSchema = z.object({
  rating: z.number(),
  comment: z
    .string()
    .min(1, "Η κριτική είναι υποχρεωτική")
    .min(25, "Η κριτική είναι μικρή")
    .max(350, "Η μέγιστη κριτική είναι 350 χαρακτήρες"),
  serviceId: z.number(),
});

export async function createServiceReview(prevState, formData) {
  try {
    const reviewData = formData.get("newReviewData");
    const review = JSON.parse(reviewData);
    const uid = await getUserId();

    // Validate review data using Zod schema
    const validation = reviewSchema.safeParse(review);

    if (!validation.success) {
      const validationErrors = validation.error.errors.reduce((acc, error) => {
        acc[error.path[0]] = error.message;
        return acc;
      }, {});

      return {
        errors: validationErrors,
        data: null,
      };
    }

    const payload = {
      rating: review.rating,
      comment: review.comment,
      service: review.serviceId,
      user: uid,
      type: 1,
      status: 2,
      publishedAt: null,
    };

    const response = await postData(POST_REVIEW, payload);

    const reviewId = response?.data?.id;

    if (reviewId) {
      return {
        data: {
          id: reviewId,
        },
      };
    }
  } catch (error) {
    console.error(error);
    return {
      errors: error?.message,
      message: "Server error. Please try again later.",
      data: null,
    };
  }
}
