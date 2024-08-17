import { gql } from "@apollo/client";

const TAG = gql`
  fragment Tag on TagEntity {
    id
    attributes {
      label
      slug
    }
  }
`;

const TAG_ENTITY = gql`
  fragment TagEntity on TagEntityResponseCollection {
    data {
      attributes {
        label
        slug
      }
    }
  }
`;

export { TAG, TAG_ENTITY };
