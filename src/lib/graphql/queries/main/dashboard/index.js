import { gql } from "@apollo/client";

export const POPULAR_SERVICES_DASHBOARD = gql`
  query PopularServicesDashboard($id: ID!) {
    services(
      filters: { freelancer: { id: { eq: $id } }, rating: { gt: 0 } }
      pagination: { pageSize: 3 }
      sort: "rating:desc"
    ) {
      data {
        attributes {
          title
          slug
          price
          media {
            data {
              attributes {
                formats
              }
            }
          }
          rating
        }
      }
    }
  }
`;
