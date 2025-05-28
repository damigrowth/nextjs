import { gql } from '@apollo/client';

const LIKES = gql`
  fragment Likes on FreelancerRelationResponseCollection {
    data {
      id
    }
  }
`;

const DISLIKES = gql`
  fragment Dislikes on FreelancerRelationResponseCollection {
    data {
      id
    }
  }
`;

const REVIEW_LIKES = gql`
  fragment ReviewLikes on ReviewRelationResponseCollection {
    data {
      id
    }
  }
`;

const REVIEW_DISLIKES = gql`
  fragment ReviewDislikes on ReviewRelationResponseCollection {
    data {
      id
    }
  }
`;

export { DISLIKES, LIKES, REVIEW_DISLIKES, REVIEW_LIKES };
