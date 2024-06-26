import { gql } from "@apollo/client";
import {
  FEATURED_SERVICE_MAIN,
  FEATURED_SERVICE_RELATIONS,
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  REVIEW,
  REVIEW_MAIN,
  REVIEW_RELATIONS,
  SERVICE_MAIN,
  SERVICE_RELATIONS,
  USER_MAIN,
  USER_RELATIONS,
} from "./parts";
import { CATEGORY, PAGINATION, SINGLE_IMAGE, TAG } from "./fragments";

const SERVICE_BY_SLUG = gql`
  query GetService($slug: String!) {
    services(filters: { slug: { eq: $slug } }) {
      data {
        id
        attributes {
          ...ServiceMain
          ...ServiceRelations
        }
      }
    }
  }
  ${SERVICE_MAIN}
  ${SERVICE_RELATIONS}
`;

const FREELANCER_BY_USERNAME = gql`
  query GetFreelancer($username: String!) {
    freelancers(filters: { username: { eq: $username } }) {
      data {
        id
        attributes {
          ...FreelancerMain
          ...FreelancerRelations
        }
      }
    }
  }
  ${FREELANCER_MAIN}
  ${FREELANCER_RELATIONS}
`;

const RATINGS = gql`
  query GetRatings {
    ratings(sort: "id:desc") {
      data {
        id
        attributes {
          label
          grade
          slug
        }
      }
    }
  }
`;

const CATEGORIES = gql`
  query GetCategories {
    categories(sort: "label:desc") {
      data {
        ...Category
      }
    }
  }
  ${CATEGORY}
`;

const TAGS = gql`
  query GetTags {
    tags(sort: "label:desc") {
      data {
        ...Tag
      }
    }
  }
  ${TAG}
`;

const COUNT_SERVICES_BY_RATING = gql`
  query GetServicesCountByRating($ratingId: ID!) {
    services(filters: { rating_global: { id: { eq: $ratingId } } }) {
      data {
        id
      }
      meta {
        pagination {
          total
        }
      }
    }
  }
`;

const COUNT_FREELANCERS_BY_RATING = gql`
  query GetFreelancersCountByRating($ratingId: ID!) {
    freelancers(filters: { rating_global: { id: { eq: $ratingId } } }) {
      data {
        id
      }
      meta {
        pagination {
          total
        }
      }
    }
  }
`;

// TODO: CREATE ALL THE FIELDS FOR USER IN THE BACKEND
const GET_ME = gql`
  query GetME {
    me {
      id
      email
    }
  }
`;

const USER_BY_ID_BASIC = gql`
  query getUserBasic($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          ...UserMain
        }
      }
    }
  }
  ${USER_MAIN}
`;

const USER_BY_ID = gql`
  query getUser($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          ...UserMain
          ...UserRelations
        }
      }
    }
  }
  ${USER_MAIN}
  ${USER_RELATIONS}
`;

const FEATURED_SERVICES_BY_FREELANCER = gql`
  query featuredServicesByFreelancer(
    $id: IDFilterInput!
    $page: Int
    $pageSize: Int
  ) {
    services(
      sort: "publishedAt:desc"
      filters: { freelancer: { id: $id } }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          ...FeaturedServiceMain
          ...FeaturedServiceRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${FEATURED_SERVICE_MAIN}
  ${FEATURED_SERVICE_RELATIONS}
  ${PAGINATION}
`;

const REVIEWS_BY_FREELANCER = gql`
  query reviewsByFreelancer($id: ID!, $page: Int, $pageSize: Int) {
    reviews(
      sort: "publishedAt:desc"
      filters: { freelancer: { id: { eq: $id } } }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          ...ReviewMain
          ...ReviewRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${REVIEW_MAIN}
  ${REVIEW_RELATIONS}
  ${PAGINATION}
`;

const ALL_REVIEWS_RATINGS_BY_FREELANCER = gql`
  query allReviewsRatingsByFreelancer($id: ID!, $pageSize: Int) {
    reviews(
      filters: { freelancer: { id: { eq: $id } } }
      pagination: { pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          rating
        }
      }
    }
  }
`;

const REVIEWS_BY_SERVICE = gql`
  query reviewsByService($id: ID!, $page: Int, $pageSize: Int) {
    reviews(
      sort: "publishedAt:desc"
      filters: { service: { id: { eq: $id } } }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          ...ReviewMain
          ...ReviewRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${REVIEW_MAIN}
  ${REVIEW_RELATIONS}
  ${PAGINATION}
`;

const ALL_REVIEWS_RATINGS_BY_SERVICE = gql`
  query allReviewsRatingsByService($id: ID!, $pageSize: Int) {
    reviews(
      filters: { service: { id: { eq: $id } } }
      pagination: { pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          rating
        }
      }
    }
  }
`;

export {
  GET_ME,
  USER_BY_ID,
  USER_BY_ID_BASIC,
  SERVICE_BY_SLUG,
  FREELANCER_BY_USERNAME,
  RATINGS,
  CATEGORIES,
  TAGS,
  COUNT_SERVICES_BY_RATING,
  COUNT_FREELANCERS_BY_RATING,
  FEATURED_SERVICES_BY_FREELANCER,
  REVIEWS_BY_FREELANCER,
  ALL_REVIEWS_RATINGS_BY_FREELANCER,
  REVIEWS_BY_SERVICE,
  ALL_REVIEWS_RATINGS_BY_SERVICE,
};
