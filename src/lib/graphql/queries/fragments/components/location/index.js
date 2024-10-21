import { gql } from "@apollo/client";
import { AREA, AREAS, COUNTY } from "../../entities/location";

const COVERAGE = gql`
  fragment Coverage on ComponentLocationCoverage {
    online
    onsite
    onbase
    address
    county {
      ...County
    }
    areas {
      ...Areas
    }
  }
  ${AREAS}
  ${COUNTY}
`;

export { COVERAGE };
