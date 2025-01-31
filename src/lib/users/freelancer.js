import { getUser, getUserId } from "../auth/user";
import { getData } from "../client/operations";
import {
  FREELANCER_BY_ID,
  FREELANCER_BY_USERNAME,
  FREELANCER_ID,
} from "../graphql/queries/main/freelancer";
import {
  ALL_REVIEWS_RATINGS_BY_FREELANCER,
  REVIEWS_BY_FREELANCER,
} from "../graphql/queries/main/reviews";
import { FEATURED_SERVICES_BY_FREELANCER } from "../graphql/queries/main/service";

export async function getFreelancerId() {
  const user = await getUser();
  if (!user) return null;
  const freelancerId = user.freelancer.data.id;
  const id = freelancerId ? freelancerId : null;
  return id;
}

export async function getFreelancer() {
  let freelancer = null;
  const user = await getUser();

  const freelancerData = user?.freelancer?.data;

  if (freelancerData) {
    freelancer = {
      id: freelancerData.id,
      ...freelancerData.attributes,
    };
  }

  return freelancer;
}

export async function getFreelancerByUsername(username) {
  try {
    let freelancer = null;
    let freelancerId = null;

    const { freelancers } = await getData(FREELANCER_BY_USERNAME, { username });

    if (freelancers?.data?.length > 0) {
      freelancer = freelancers.data[0].attributes;

      freelancerId = toString(freelancers.data[0].id);
    }

    return { freelancer, freelancerId };
  } catch (error) {
    console.error("Error fetching freelancer by username:", error);
    return null;
  }
}

export async function getReviewsByFreelancer(uid, page, pageSize) {
  try {
    let reviews = [];
    let reviewsMeta = null;

    const res = await getData(REVIEWS_BY_FREELANCER, {
      id: uid,
      page: page,
      pageSize: pageSize,
    });

    if (res?.reviews?.data?.length > 0) {
      reviews = res.reviews.data;
      reviewsMeta = res.reviews.meta.pagination;
    } else {
      return { reviews, reviewsMeta };
    }

    return { reviews, reviewsMeta };
  } catch (error) {
    console.error("Error fetching freelancer reviews:", error);
    return [];
  }
}

export async function getAllReviewsRatingsByFreelancer(uid, pageSize) {
  try {
    let allReviewsRatings = [];

    const { reviews } = await getData(ALL_REVIEWS_RATINGS_BY_FREELANCER, {
      id: uid,
      pageSize: pageSize,
    });

    if (reviews?.data?.length > 0) {
      allReviewsRatings = reviews.data;
    } else {
      return { allReviewsRatings };
    }

    return { allReviewsRatings };
  } catch (error) {
    console.error("Error fetching freelancer reviews:", error);
    return [];
  }
}

export async function getFeaturedServicesByFreelancer(uid, pageSize) {
  try {
    let services = [];
    let servicesMeta = null;

    const res = await getData(FEATURED_SERVICES_BY_FREELANCER, {
      id: { eq: uid },
      page: 1,
      pageSize: pageSize,
    });

    if (res?.services?.data?.length > 0) {
      services = res.services.data;
      servicesMeta = res.services.meta.pagination;
    } else {
      return { services, servicesMeta };
    }

    return { services, servicesMeta };
  } catch (error) {
    console.error("Error fetching freelancer services:", error);
    return [];
  }
}
