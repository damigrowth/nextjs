import { gql } from "@apollo/client";

const POST_REVIEW = gql`
  mutation CreateReview($data: ReviewInput!) {
    createReview(data: $data) {
      data {
        id
      }
    }
  }
`;

const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $data: ReviewInput!) {
    updateReview(id: $id, data: $data) {
      data {
        id
        attributes {
          freelancer {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

const POST_SERVICE = gql`
  mutation CreateService($data: ServiceInput!) {
    createService(data: $data) {
      data {
        id
      }
    }
  }
`;

const UPDATE_FREELANCER_RATING = gql`
  mutation updateFreelancerRating($id: ID!, $data: FreelancerInput!) {
    updateFreelancer(id: $id, data: $data) {
      data {
        id
        attributes {
          rating
          rating_global {
            data {
              id
              attributes {
                label
                grade
              }
            }
          }
        }
      }
    }
  }
`;

const UPDATE_SERVICE_RATING = gql`
  mutation updateServiceRating($id: ID!, $data: ServiceInput!) {
    updateService(id: $id, data: $data) {
      data {
        id
        attributes {
          rating
          rating_global {
            data {
              id
              attributes {
                label
                grade
              }
            }
          }
        }
      }
    }
  }
`;

const UPDATE_SERVICE_SLUG = gql`
  mutation updateServiceSlug($id: ID!, $slug: String!) {
    updateService(id: $id, data: { slug: $slug }) {
      data {
        id
        attributes {
          slug
        }
      }
    }
  }
`;

export {
  POST_REVIEW,
  POST_SERVICE,
  UPDATE_FREELANCER_RATING,
  UPDATE_SERVICE_RATING,
  UPDATE_REVIEW,
  UPDATE_SERVICE_SLUG,
};
