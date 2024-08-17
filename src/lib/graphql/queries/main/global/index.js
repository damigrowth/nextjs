import { gql } from "@apollo/client";

const HEADER = gql`
  query Header {
    header {
      data {
        attributes {
          categories {
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
          categories {
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

export { HEADER, FOOTER };
