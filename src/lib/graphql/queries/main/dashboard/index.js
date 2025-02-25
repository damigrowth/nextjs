import { gql } from "@apollo/client";
import { PAGINATION } from "../../fragments/global";

export const ALL_SERVICES_DASHBOARD = gql`
  query AllServicesDashboard($id: ID!) {
    services(
      filters: {
        freelancer: { id: { eq: $id } }
        or: [
          { status: { type: { eq: "Active" } } }
          { status: { type: { eq: "Pending" } } }
        ]
      }
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

export const ALL_REVIEWS_RECEIVED_DASHBOARD = gql`
  query AllReviewsReceivedDashboard($id: ID!, $page: Int) {
    reviews(
      filters: { receiver: { id: { eq: $id } } }
      pagination: { page: $page, pageSize: 3 }
      sort: "rating:desc"
    ) {
      data {
        attributes {
          rating
          comment
          publishedAt
          author {
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
  query AllReviewsGivenDashboard($id: ID!, $page: Int) {
    reviews(
      filters: { author: { id: { eq: $id } } }
      pagination: { page: $page, pageSize: 3 }
      sort: "rating:desc"
    ) {
      data {
        attributes {
          rating
          comment
          publishedAt
          receiver {
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
