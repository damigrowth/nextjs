"use server";

import { putData } from "../api";
import { REVIEW_REACT } from "../queries";

// React to a Review - Like or Dislike
export async function reviewReaction(prevState, formData) {
  try {
    const reactions = formData.get("reactions");
    const reaction = JSON.parse(reactions);

    const likesPayload = {
      likes: reaction.likes,
    };

    const dislikesPayload = {
      dislikes: reaction.dislikes,
    };

    const likesResponse = await putData(
      REVIEW_REACT("like", reaction.reviewId),
      likesPayload
    );

    const dislikesResponse = await putData(
      REVIEW_REACT("dislike", reaction.reviewId),
      dislikesPayload
    );
  } catch (error) {
    console.error(error);
    return {
      errors: error?.message,
      message: "Server error. Please try again later.",
      data: null,
    };
  }
}
