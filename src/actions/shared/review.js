'use server';

import { postData } from '@/lib/client/operations';
import { POST_REVIEW } from '@/lib/graphql';

import { reviewSchema } from '../schema/review';
import { getFreelancerId } from './freelancer';

export async function createReview(prevState, formData) {
  try {
    const reviewData = formData.get('newReviewData');

    const review = JSON.parse(reviewData);

    const authorId = await getFreelancerId();

    // Validate review data using Zod schema
    const validation = reviewSchema.safeParse(review);

    if (!validation.success) {
      const validationErrors = validation.error.errors.reduce((acc, error) => {
        if (error.path.length > 1 && error.path[0] === 'service') {
          acc['service'] = error.message;
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

    // ✅ Check SUCCESS first
    if (response?.data?.createReview?.data?.id) {
      return {
        data: {
          id: response.data.createReview.data.id,
        },
        errors: {},
        message: 'Η αξιολόγησή σας υποβλήθηκε με επιτυχία!',
      };
    }

    // ✅ Handle ERRORS from postData (Greek messages)
    if (response?.error) {
      return {
        errors: {
          submit: response.error, // Greek error message from postData
        },
        message: null,
        data: null,
      };
    }

    // ✅ Fallback if no data and no error
    return {
      errors: {
        submit:
          'Δεν ήταν δυνατή η υποβολή της αξιολόγησης. Προσπαθήστε ξανά.',
      },
      message: null,
      data: null,
    };
  } catch (error) {
    console.error(error);

    return {
      errors: {
        submit: 'Σφάλμα διακομιστή. Προσπαθήστε ξανά αργότερα.',
      },
      message: null,
      data: null,
    };
  }
}
