import { gql } from "@apollo/client";
import { PAGINATION } from "../../fragments/global";

const COUNTIES_SEARCH = gql`
  query CountiesSearch(
    $name: String
    $coverageCountyPage: Int
    $coverageCountyPageSize: Int
  ) {
    counties(
      filters: { name: { containsi: $name } }
      sort: "name:asc"
      pagination: {
        page: $coverageCountyPage
        pageSize: $coverageCountyPageSize
      }
    ) {
      data {
        id
        attributes {
          name
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
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
