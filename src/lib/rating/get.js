// "use server";

import { getData } from "../client/operations";
import { COUNT_FREELANCERS_BY_RATING } from "../graphql/queries/main/freelancer";
import { RATINGS } from "../graphql/queries/main/reviews";
import { COUNT_SERVICES_BY_RATING } from "../graphql/queries/main/service";

export async function getRatings() {
  try {
    const ratingsData = await getData(RATINGS);
    const ratings = ratingsData.ratings?.data;
    return ratings;
  } catch (error) {
    console.log("There was an error fetching the ratings!", error?.message);
    return null;
  }
}

export async function getRatingsModelCount(type, id) {
  try {
    let count = null;

    if (type === "freelancer") {
      const { freelancers } = await getData(COUNT_FREELANCERS_BY_RATING, {
        ratingId: id,
      });

      count = freelancers?.meta?.pagination?.total || 0;
    } else if (type === "service") {
      const { services } = await getData(COUNT_SERVICES_BY_RATING, {
        ratingId: id,
      });

      count = services?.meta?.pagination?.total || 0;
    } else if (type === "employer") {
      // TODO: Future milestone
    } else {
      count = null;
    }

    return count;
  } catch (error) {
    console.log("There was an error fetching the model count!", error?.message);
    return null;
  }
}
