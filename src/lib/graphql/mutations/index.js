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

const EDIT_SERVICE = gql`
  mutation EditService($id: ID!, $data: ServiceInput!) {
    updateService(id: $id, data: $data) {
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

const CONTACT = gql`
  mutation Contact($data: EmailInput!) {
    createEmail(data: $data) {
      data {
        id
      }
    }
  }
`;

const UPLOAD = gql`
  mutation Upload(
    $refId: ID
    $ref: String
    $field: String
    $info: FileInfoInput
    $file: Upload!
  ) {
    upload(refId: $refId, ref: $ref, field: $field, info: $info, file: $file) {
      data {
        id
        attributes {
          hash
          name
        }
      }
    }
  }
`;

const SAVED_SERVICE = gql`
  query SavedService($serviceId: String!) {
    checkSavedService(serviceId: $serviceId) {
      isSaved
      serviceId
    }
  }
`;

const SAVED_FREELANCER = gql`
  query SavedFreelancer($freelancerId: String!) {
    checkSavedFreelancer(freelancerId: $freelancerId) {
      isSaved
      freelancerId
    }
  }
`;

const SAVE_SERVICE = gql`
  mutation SaveService($serviceId: String!) {
    saveService(serviceId: $serviceId) {
      success
      message
    }
  }
`;

const UNSAVE_SERVICE = gql`
  mutation UnsaveService($serviceId: String!) {
    unsaveService(serviceId: $serviceId) {
      success
      message
    }
  }
`;

const SAVE_FREELANCER = gql`
  mutation SaveFreelancer($freelancerId: String!) {
    saveFreelancer(freelancerId: $freelancerId) {
      success
      message
    }
  }
`;

const UNSAVE_FREELANCER = gql`
  mutation UnsaveFreelancer($freelancerId: String!) {
    unsaveFreelancer(freelancerId: $freelancerId) {
      success
      message
    }
  }
`;

export {
  POST_REVIEW,
  POST_SERVICE,
  EDIT_SERVICE,
  UPDATE_FREELANCER_RATING,
  UPDATE_SERVICE_RATING,
  UPDATE_REVIEW,
  UPDATE_SERVICE_SLUG,
  CONTACT,
  UPLOAD,
};
