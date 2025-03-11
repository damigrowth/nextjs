"use server";

import { z } from "zod";
import { postData } from "../client/operations";
import { POST_REVIEW } from "../graphql/mutations";
import { getFreelancerId } from "../users/freelancer";

const reviewSchema = z
  .object({
    type: z.string(),
    rating: z
      .number({
        required_error:
          "Πρέπει να επιλέξετε Βαθμολογία για να υποβάλετε την αξιολόγηση.",
      })
      .min(
        1,
        "Πρέπει να επιλέξετε Βαθμολογία για να υποβάλετε την αξιολόγηση."
      ),
    service: z.object({
      id: z.string().optional(),
    }),
    comment: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Only require service for freelancer type reviews
    if (data.type === "freelancer" && (!data.service || !data.service.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Πρέπει να επιλέξετε Υπηρεσία για να υποβάλετε την αξιολόγηση.",
        path: ["service"],
      });
    }
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
        if (error.path.length > 1 && error.path[0] === "service") {
          acc["service"] = error.message;
        } else {
          acc[error.path[0]] = error.message;
        }
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
