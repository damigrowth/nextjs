import { gql } from "@apollo/client";

const GET_COMPANY_PAGE = gql`
  query GetCompanyPage($slug: String) {
    pages(filters: { slug: { eq: $slug } }) {
      data {
        attributes {
          title
          content
        }
      }
    }
  }
`;

const GET_PAGE_BY_SLUG = gql`
  query GetPage($slug: String) {
    pages(filters: { slug: { eq: $slug } }) {
      data {
        attributes {
          title
          description
          faq {
            __typename
            ... on ComponentGlobalFaq {
              title
              faq {
                question
                answer
              }
            }
          }
        }
      }
    }
  }
`;

export { GET_COMPANY_PAGE, GET_PAGE_BY_SLUG };
