const { gql } = require("@apollo/client");

const POST_REVIEW = gql`
  mutation CreateReview($data: ReviewInput!) {
    createReview(data: $data) {
      data {
        id
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

export { POST_REVIEW, POST_SERVICE };
