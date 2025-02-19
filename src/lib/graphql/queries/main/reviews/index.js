import { gql } from "@apollo/client";
import { REVIEW_MAIN, REVIEW_RELATIONS } from "../../parts/review";
import { PAGINATION } from "../../fragments/global";

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

const REVIEWS_BY_FREELANCER = gql`
  query reviewsByFreelancer($id: ID!, $page: Int, $pageSize: Int) {
    reviews(
      sort: "publishedAt:desc"
      filters: { receiver: { id: { eq: $id } } }
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
      filters: { receiver: { id: { eq: $id } } }
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
  RATINGS,
  REVIEWS_BY_FREELANCER,
  ALL_REVIEWS_RATINGS_BY_FREELANCER,
  REVIEWS_BY_SERVICE,
  ALL_REVIEWS_RATINGS_BY_SERVICE,
};
