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

const LOGIN_USER = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;

const REGISTER_USER = gql`
  mutation Register($input: UsersPermissionsRegisterInput!) {
    register(input: $input) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $roleId: ID
    $displayName: String
    $consent: Boolean
    $freelancer: ID
    $username: String
  ) {
    updateUsersPermissionsUser(
      id: $id
      data: {
        role: $roleId
        freelancer: $freelancer
        username: $username
        displayName: $displayName
        consent: $consent
      }
    ) {
      data {
        id
        attributes {
          freelancer {
            data {
              id
            }
          }
          role {
            data {
              id
              attributes {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_FREELANCER = gql`
  mutation CreateFreelancer($data: FreelancerInput!) {
    createFreelancer(data: $data) {
      data {
        id
        attributes {
          username
          email
          type {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

const UPDATE_FREELANCER = gql`
  mutation UpdateFreelancer($id: ID!, $data: FreelancerInput!) {
    updateFreelancer(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      ok
    }
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword(
    $resetCode: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    resetPassword(
      code: $resetCode
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      jwt
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

const CREATE_TAG = gql`
  mutation CreateTag($data: TagInput!) {
    createTag(data: $data) {
      data {
        id
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const EMAIL_CONFIRMATION = gql`
  mutation UserEmailConfirmation($code: String!) {
    emailConfirmation(confirmation: $code) {
      jwt
      user {
        id
        email
        username
        role {
          id
        }
      }
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
  LOGIN_USER,
  REGISTER_USER,
  UPDATE_USER,
  CREATE_FREELANCER,
  UPDATE_FREELANCER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  SAVED_SERVICE,
  SAVED_FREELANCER,
  SAVE_SERVICE,
  UNSAVE_SERVICE,
  SAVE_FREELANCER,
  UNSAVE_FREELANCER,
  CREATE_TAG,
  EMAIL_CONFIRMATION,
};
