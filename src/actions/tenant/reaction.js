'use server';

import { putData } from '@/lib/rest/api';
import { REVIEW_REACT } from '@/lib/rest/queries';

// React to a Review - Like or Dislike - REMOVED DISLIKES
export async function reviewReaction(reaction) {
  try {
    const likesPayload = {
      likes: reaction.likes,
    };

    // const dislikesPayload = {
    //   dislikes: reaction.dislikes,
    // };
    await putData(REVIEW_REACT('like', reaction.reviewId), likesPayload);
    // await putData(REVIEW_REACT("dislike", reaction.reviewId), dislikesPayload);
  } catch (error) {
    console.error(error);

    return {
      errors: error?.message,
      message: 'Server error. Please try again later.',
      data: null,
    };
  }
}
