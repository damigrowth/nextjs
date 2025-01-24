const { gql } = require("@apollo/client");

export const DRAFT_TAG = gql`
  query GetDraftTag($slug: String!) {
    tags(filters: { slug: { eq: $slug } }, publicationState: PREVIEW) {
      data {
        id
      }
    }
  }
`;
