import { getData } from "../client/operations";
import {
  ALL_REVIEWS_RATINGS_BY_SERVICE,
  REVIEWS_BY_SERVICE,
} from "../graphql/queries/main/reviews";
import {
  SERVICE_BY_ID,
  SERVICE_BY_SLUG,
  SERVICES_BY_ID,
} from "../graphql/queries/main/service";

export async function getServiceById(id) {
  try {
    const { service } = await getData(SERVICE_BY_ID, { id });
    if (service && service?.data?.id) {
      return { id: service.data.id, ...service.data.attributes };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching service by id:", error);
    return null;
  }
}

export async function getServicesById(id) {
  try {
    const { services } = await getData(SERVICES_BY_ID, { id });
    if (services && services?.data?.[0]?.id) {
      return { id: services?.data?.[0]?.id, ...services.data[0].attributes };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching services by id:", error);
    return null;
  }
}

export async function getServiceBySlug(slug) {
  try {
    let service = null;

    let serviceId = null;

    const { services } = await getData(SERVICE_BY_SLUG, { slug });

    if (services?.data?.length > 0) {
      service = services.data[0].attributes;

      serviceId = Number(services.data[0].id);
    }

    return { service, serviceId };
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }
}

export async function getReviewsByService(serviceId, page, pageSize) {
  try {
    let reviews = [];
    let reviewsMeta = null;

    const res = await getData(REVIEWS_BY_SERVICE, {
      id: serviceId,
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

export async function getAllReviewsRatingsByService(serviceId, pageSize) {
  try {
    let allReviewsRatings = [];

    const { reviews } = await getData(ALL_REVIEWS_RATINGS_BY_SERVICE, {
      id: serviceId,
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
