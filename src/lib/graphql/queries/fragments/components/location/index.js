import { gql } from '@apollo/client';

const COVERAGE = gql`
  fragment Coverage on ComponentLocationCoverage {
    online
    onsite
    onbase
    address
    county {
      data {
        id
        attributes {
          name
        }
      }
    }
    area {
      data {
        id
        attributes {
          name
        }
      }
    }
    zipcode {
      data {
        id
        attributes {
          name
        }
      }
    }
    areas {
      data {
        id
        attributes {
          name
          county {
            data {
              id
            }
          }
        }
      }
    }
    counties {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

export { COVERAGE };
