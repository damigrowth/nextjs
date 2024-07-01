"use server";

import { z } from "zod";
import { getUserId } from "../user/user";
import { postData } from "../client/operations";
import { POST_REVIEW } from "../graphql/mutations";

const reviewSchema = z.object({
  rating: z.number(),
  comment: z
    .string()
    .min(1, "Η αξιολόγηση είναι υποχρεωτική")
    .min(25, "Η αξιολόγηση είναι μικρή")
    .max(350, "Η μέγιστη αξιολόγηση είναι 350 χαρακτήρες"),
  modelId: z.number(),
});

export async function createModelReview(prevState, formData) {
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
      [review.modelType]: Number(review.modelId),
      [review.tenantType]: Number(review.tenantId),
      rating: review.rating,
      comment: review.comment,
      user: uid,
      type: 1,
      status: 2,
      publishedAt: null,
    };

    const response = await postData(POST_REVIEW, { data: payload });

    const reviewId = response?.createReview?.data?.id;

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
