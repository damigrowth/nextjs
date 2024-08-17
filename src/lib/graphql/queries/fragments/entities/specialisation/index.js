import { gql } from "@apollo/client";

const SPECIALISATIONS = gql`
  fragment Specialisations on SkillRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { SPECIALISATIONS };
