import { gql } from "@apollo/client";

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

export { REVIEW_LIKES, REVIEW_DISLIKES };
