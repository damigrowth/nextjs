import { gql } from '@apollo/client';

const COUNTY = gql`
  fragment County on CountyEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const AREA = gql`
  fragment Area on AreaEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const AREAS = gql`
  fragment Areas on AreaRelationResponseCollection {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const ZIPCODE = gql`
  fragment Zipcode on AreaEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const COUNTIES = gql`
  fragment Counties on ComponentLocationCoverageFiltersInput {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

export { AREA, AREAS, COUNTIES, COUNTY, ZIPCODE };
