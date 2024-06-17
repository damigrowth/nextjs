import { gql } from "@apollo/client";
import {
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  SERVICE_MAIN,
  SERVICE_RELATIONS,
} from "./parts";
import { CATEGORY, TAG } from "./fragments";

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

function FREELANCER_BY_USERNAME(username) {
  const qr = gql`
  query GetFreelancer {
    freelancers(filters: { username: { eq: "${username}" } }) {
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
  return qr;
}

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

export const COUNT_SERVICES_BY_RATING = gql`
  query GetServicesCountByRating($ratingId: ID!) {
    ratings(filters: { id: { eq: $ratingId } }) {
      data {
        id
        attributes {
          services {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

export {
  SERVICE_BY_SLUG,
  FREELANCER_BY_USERNAME,
  RATINGS,
  CATEGORIES,
  TAGS,
  COUNT_SERVICES_BY_RATING,
};
