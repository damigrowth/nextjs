import { gql } from "@apollo/client";

const COUNTIES_SEARCH = gql`
  query CountiesSearch($name: String) {
    counties(filters: { name: { containsi: $name } }, sort: "name:asc") {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const AREAS_SEARCH = gql`
  query AreasSearch($countyId: ID, $areaTerm: String) {
    areas(
      filters: {
        county: { id: { eq: $countyId } }
        name: { containsi: $areaTerm }
      }
      sort: "name:asc"
    ) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const ZIPCODES_SEARCH = gql`
  query ZipcodesSearch($areaId: ID, $zipcodeTerm: String) {
    zipcodes(
      filters: {
        area: { id: { eq: $areaId } }
        name: { containsi: $zipcodeTerm }
      }
      sort: "name:asc"
    ) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

export { COUNTIES_SEARCH, AREAS_SEARCH, ZIPCODES_SEARCH };
