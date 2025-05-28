import { gql } from '@apollo/client';

const CONTACT_TYPES = gql`
  query ContactTypes {
    contactTypes {
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

export { CONTACT_TYPES };
