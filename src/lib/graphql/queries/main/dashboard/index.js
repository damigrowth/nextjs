import { gql } from "@apollo/client";
import { PAGINATION } from "../../fragments/global";

export const ALL_SERVICES_DASHBOARD = gql`
  query AllServicesDashboard($id: ID!) {
    services(
      filters: { freelancer: { id: { eq: $id } } }
      pagination: { page: 1, pageSize: 3 }
      sort: "publishedAt:desc"
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
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

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

// TODO: Solve the issue with the user field
export const ALL_REVIEWS_RECEIVED_DASHBOARD = gql`
  query AllReviewsReceivedDashboard($id: ID!) {
    reviews(
      filters: {
        freelancer: { id: { eq: $id } }
        user: { id: { notNull: true } }
      }
      pagination: { page: 1, pageSize: 3 }
      sort: "rating:desc"
    ) {
      data {
        attributes {
          rating
          comment
          publishedAt
          user {
            data {
              attributes {
                firstName
                lastName
                displayName
                username
                image {
                  data {
                    attributes {
                      formats
                    }
                  }
                }
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

export const ALL_REVIEWS_GIVEN_DASHBOARD = gql`
  query AllReviewsGivenDashboard($id: ID!) {
    reviews(
      filters: { user: { id: { eq: $id } } }
      pagination: { page: 1, pageSize: 3 }
      sort: "rating:desc"
    ) {
      data {
        attributes {
          rating
          comment
          publishedAt
          freelancer {
            data {
              attributes {
                firstName
                lastName
                displayName
                username
                image {
                  data {
                    attributes {
                      formats
                    }
                  }
                }
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
