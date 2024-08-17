import { gql } from "@apollo/client";

const INDUSTRIES = gql`
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

export { INDUSTRIES };
