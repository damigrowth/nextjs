import { gql } from "@apollo/client";

const COVERAGE = gql`
  fragment Coverage on ComponentLocationCoverage {
    online
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

const BASE = gql`
  fragment Base on ComponentLocationLocation {
    online
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
  }
`;

export { COVERAGE, BASE };
