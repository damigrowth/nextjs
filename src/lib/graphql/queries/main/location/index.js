import { gql } from '@apollo/client';
import { PAGINATION } from '../../fragments';

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
  query AreasSearch(
    $countyId: ID
    $areaTerm: String
    $coverageAreasPage: Int
    $coverageAreasPageSize: Int
  ) {
    areas(
      filters: {
        county: { id: { eq: $countyId } }
        name: { containsi: $areaTerm }
      }
      sort: "name:asc"
      pagination: { page: $coverageAreasPage, pageSize: $coverageAreasPageSize }
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

const ZIPCODES_SEARCH = gql`
  query ZipcodesSearch(
    $areaId: ID
    $zipcodeTerm: String
    $coverageZipcodesPage: Int
    $coverageZipcodesPageSize: Int
  ) {
    zipcodes(
      filters: {
        area: { id: { eq: $areaId } }
        name: { containsi: $zipcodeTerm }
      }
      sort: "name:asc"
      pagination: {
        page: $coverageZipcodesPage
        pageSize: $coverageZipcodesPageSize
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

const ONBASE_ZIPCODES = gql`
  query OnbaseZipcodes(
    $name: String
    $onbaseZipcodesPage: Int
    $onbaseZipcodesPageSize: Int
  ) {
    zipcodes(
      filters: { name: { containsi: $name } }
      sort: "name:asc"
      pagination: {
        page: $onbaseZipcodesPage
        pageSize: $onbaseZipcodesPageSize
      }
    ) {
      data {
        id
        attributes {
          name
          area {
            data {
              id
              attributes {
                name
              }
            }
          }
          county {
            data {
              id
              attributes {
                name
              }
            }
          }
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

const ONSITE_COUNTIES = gql`
  query OnsiteCounties(
    $name: String
    $onsiteCountiesPage: Int
    $onsiteCountiesPageSize: Int
  ) {
    counties(
      filters: { name: { containsi: $name } }
      sort: "name:asc"
      pagination: {
        page: $onsiteCountiesPage
        pageSize: $onsiteCountiesPageSize
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

const ONSITE_AREAS = gql`
  query OnsiteAreas(
    $name: String
    $onsiteAreasPage: Int
    $onsiteAreasPageSize: Int
    $counties: [ID]
  ) {
    areas(
      filters: {
        and: [
          { name: { containsi: $name } }
          { county: { id: { in: $counties } } }
        ]
      }
      sort: "name:asc"
      pagination: { page: $onsiteAreasPage, pageSize: $onsiteAreasPageSize }
    ) {
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
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

export {
  AREAS_SEARCH,
  COUNTIES_SEARCH,
  ONBASE_ZIPCODES,
  ONSITE_AREAS,
  ONSITE_COUNTIES,
  ZIPCODES_SEARCH,
};
