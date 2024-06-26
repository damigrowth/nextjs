import { getData } from "../client/operations";
import {
  ALL_REVIEWS_RATINGS_BY_SERVICE,
  REVIEWS_BY_SERVICE,
  SERVICE_BY_SLUG,
} from "../graphql/queries";

export async function getServiceBySlug(slug) {
  try {
    let service = null;

    let uid = null;

    const { services } = await getData(SERVICE_BY_SLUG, { slug });

    if (services?.data?.length > 0) {
      service = services.data[0].attributes;

      uid = Number(services.data[0].id);
    }

    return { service, uid };
  } catch (error) {
    console.error("Error fetching freelancer by slug:", error);
    return null;
  }
}

export async function getReviewsByService(uid, page, pageSize) {
  try {
    let reviews = [];
    let reviewsMeta = null;

    const res = await getData(REVIEWS_BY_SERVICE, {
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
    console.error("Error fetching service reviews:", error);
    return [];
  }
}

export async function getAllReviewsRatingsByService(uid, pageSize) {
  try {
    let allReviewsRatings = [];

    const { reviews } = await getData(ALL_REVIEWS_RATINGS_BY_SERVICE, {
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
    console.error("Error fetching service reviews:", error);
    return [];
  }
}
