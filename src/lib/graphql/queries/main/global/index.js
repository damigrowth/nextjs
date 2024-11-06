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

const ROOT_LAYOUT = gql`
  query RootLayout {
    header {
      data {
        attributes {
          categories(sort: "label:asc") {
            data {
              attributes {
                label
                slug
                icon
                subcategories(sort: "label:asc", pagination: { limit: 6 }) {
                  data {
                    attributes {
                      label
                      slug
                      subdivisions(
                        sort: "label:asc"
                        pagination: { limit: 4 }
                      ) {
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
            }
          }
        }
      }
    }
  }
`;

export { MAINTENANCE_STATUS, ROOT_LAYOUT };
