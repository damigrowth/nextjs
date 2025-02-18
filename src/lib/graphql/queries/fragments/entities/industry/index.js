import { gql } from "@apollo/client";

const INDUSTRIES_ENTITY = gql`
  fragment Industries on IndustryRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { INDUSTRIES_ENTITY };
