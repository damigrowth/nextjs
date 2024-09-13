import { gql } from "@apollo/client";

const MAINTENANCE_STATUS = gql`
  query Maintenance {
    maintenance {
      data {
        attributes {
          isActive
        }
      }
    }
  }
`;

const HEADER = gql`
  query Header {
    header {
      data {
        attributes {
          categories(sort: "label:asc") {
            data {
              attributes {
                label
                slug
              }
            }
          }
        }
      }
    }
  }
`;

const FOOTER = gql`
  query Footer {
    footer {
      data {
        attributes {
          company {
            data {
              attributes {
                title
                slug
              }
            }
          }
          categories(sort: "label:asc") {
            data {
              attributes {
                label
                slug
              }
            }
          }
        }
      }
    }
  }
`;

export { MAINTENANCE_STATUS, HEADER, FOOTER };
