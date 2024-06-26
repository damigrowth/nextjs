"use server";

import { putData } from "../client/operations";
import { UPDATE_FREELANCER_RATING } from "../graphql/mutations";
import { getRatingsModelCount } from "./get";

// GET MODEL COUNT OF SPECIFIC RATING
// const ratingModelCount = await getRatingsModelCount(
//   type,
//   rating_global.data.id
// );

// React to a Review - Like or Dislike
export async function updateRating(prevState, formData) {
  try {
    const getRatingData = formData.get("rating");
    const ratingData = JSON.parse(getRatingData);
    const { type, modelId, sortedRating, averageRating } = ratingData;

    let resData = {
      newRating: 0,
      newGlobalRating: null,
      newRatingModelCount: 0,
    };

    const qvData = {
      id: modelId,
      data: {
        rating: averageRating,
        rating_global: sortedRating.id,
      },
    };

    if (type === "freelancer") {
      const { updateFreelancer } = await putData(
        UPDATE_FREELANCER_RATING,
        qvData
      );

      const ratingModelCount = await getRatingsModelCount(
        type,
        sortedRating.id
      );

      resData = {
        newRating: updateFreelancer.data.attributes.rating,
        newGlobalRating: updateFreelancer.data.attributes.rating_global?.data,
        newRatingModelCount: ratingModelCount,
      };

      return {
        errors: null,
        message: "Freelancer Ratings Updated Successfully!",
        data: resData,
      };
    } else if (type === "service") {
    } else if (type === "employer") {
    } else {
    }

    // if (ratingData.serviceRating !== ratingData.averageRating) {
    //   let resData = {};

    //   // GET SERVICES COUNT OF SPECIFIC RATING
    //   const ratingServices = await getData(

    //     RATING_SERVICES_COUNT(ratingData.sortedRating.id)
    //   );

    //   const ratingServicesCount =
    //     ratingServices.data.attributes.services.data.length;

    //   // POST NEW rating & rating_global
    //   const data = {
    //     rating: ratingData.averageRating,
    //     rating_global: ratingData.sortedRating.id,
    //   };

    //   const res = await putData(
    //     SERVICE_RATING_UPDATE(ratingData.serviceId),
    //     data
    //   );

    //   // POST THE RESPONSE DATA
    //   resData = {
    //     newRating: res?.data?.attributes?.rating,
    //     newGlobalRating: res?.data?.attributes?.rating_global?.data,
    //     newRatingServicesCount: ratingServicesCount,
    //   };

    //   return {
    //     errors: null,
    //     message: "Ratings Updated Successfully!",
    //     data: resData,
    //   };
    // }
  } catch (error) {
    console.error(error);
    return {
      errors: error?.message,
      message: "Server error. Please try again later.",
      data: null,
    };
  }
}
