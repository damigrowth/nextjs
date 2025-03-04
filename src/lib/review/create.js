"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { POST_REVIEW } from "../graphql/mutations";
import { getFreelancerId } from "../users/freelancer";

const reviewSchema = z.object({
  rating: z.number(),
  comment: z
    .string()
    .min(1, "Η αξιολόγηση είναι υποχρεωτική")
    .min(25, "Η αξιολόγηση είναι μικρή")
    .max(350, "Η μέγιστη αξιολόγηση είναι 350 χαρακτήρες"),
});

export async function createReview(prevState, formData) {
  try {
    const reviewData = formData.get("newReviewData");
    const review = JSON.parse(reviewData);
    const authorId = await getFreelancerId();

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
        message: null,
      };
    }

    const payload = {
      service: review.service.id,
      receiver: review.receiver,
      author: authorId,
      rating: Number(review.rating),
      comment: review.comment,
      type: 1,
      status: 2,
      publishedAt: null,
    };

    const response = await postData(POST_REVIEW, { data: payload });

    const reviewId = response?.data?.createReview?.data?.id;

    if (reviewId) {
      return {
        data: {
          id: reviewId,
        },
        errors: {},
        message: "Η αξιολόγησή σας υποβλήθηκε με επιτυχία!",
      };
    } else {
      return {
        errors: {
          submit:
            "Δεν ήταν δυνατή η υποβολή της αξιολόγησης. Προσπαθήστε ξανά.",
        },
        message: null,
        data: null,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      errors: {
        submit: "Σφάλμα διακομιστή. Παρακαλώ προσπαθήστε ξανά αργότερα.",
      },
      message: null,
      data: null,
    };
  }
}
