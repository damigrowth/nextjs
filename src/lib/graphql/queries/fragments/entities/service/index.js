import { gql } from "@apollo/client";

const SERVICE = gql`
  fragment Service on ServiceEntityResponse {
    data {
      id
      attributes {
        title
        slug
      }
    }
  }
`;

const SERVICES = gql`
  fragment Services on ServiceRelationResponseCollection {
    data {
      id
      attributes {
        title
        slug
      }
    }
  }
`;

export { SERVICE, SERVICES };
