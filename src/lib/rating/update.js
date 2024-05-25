"use server";

import { getData, putData } from "../api";
import { RATING_SERVICES_COUNT, SERVICE_RATING_UPDATE } from "../queries";

// React to a Review - Like or Dislike
export async function updateRating(prevState, formData) {
  try {
    const getRatingData = formData.get("rating");
    const ratingData = JSON.parse(getRatingData);

    if (ratingData.serviceRating !== ratingData.averageRating) {
      let resData = {};

      // GET SERVICES COUNT OF SPECIFIC RATING
      const ratingServices = await getData(
        RATING_SERVICES_COUNT(ratingData.sortedRating.id)
      );

      const ratingServicesCount =
        ratingServices.data.attributes.services.data.length;

      // POST NEW rating & rating_global
      const data = {
        rating: ratingData.averageRating,
        rating_global: ratingData.sortedRating.id,
      };

      const res = await putData(
        SERVICE_RATING_UPDATE(ratingData.serviceId),
        data
      );

      // POST THE RESPONSE DATA
      resData = {
        newRating: res.data.attributes.rating,
        newGlobalRating: res.data.attributes.rating_global.data,
        newRatingServicesCount: ratingServicesCount,
      };

      return {
        errors: null,
        message: "Ratings Updated Successfully!",
        data: resData,
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
