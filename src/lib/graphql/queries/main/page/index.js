import { gql } from "@apollo/client";

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
          tabs {
            __typename
            ... on ComponentGlobalTabs {
              title
              content {
                heading
                paragraph
              }
            }
          }
        }
      }
    }
  }
`;

export { GET_PAGE_BY_SLUG };
