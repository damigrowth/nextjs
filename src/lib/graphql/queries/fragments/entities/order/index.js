import { gql } from '@apollo/client';

const ORDERS = gql`
  fragment Orders on OrderRelationResponseCollection {
    data {
      id
      attributes {
        status {
          data {
            id
            attributes {
              type
            }
          }
        }
      }
    }
  }
`;

export { ORDERS };
