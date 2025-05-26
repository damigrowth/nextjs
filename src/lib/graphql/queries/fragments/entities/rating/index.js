import { gql } from '@apollo/client';

// TODO: Add id
const RATING = gql`
  fragment Rating on RatingEntityResponse {
    data {
      id
      attributes {
        label
        grade
        slug
      }
    }
  }
`;

export { RATING };
