import { gql } from '@apollo/client';

const CONTACT_TYPES_FRAGMENT = gql`
  fragment ContactTypes on ContactTypeRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { CONTACT_TYPES_FRAGMENT };
