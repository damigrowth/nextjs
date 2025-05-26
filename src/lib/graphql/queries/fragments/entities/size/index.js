import { gql } from '@apollo/client';

const SIZE = gql`
  fragment Size on SizeEntityResponse {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { SIZE };
