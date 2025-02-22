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

const SPECIALIZATION_ENTITY = gql`
  fragment SpecializationEntity on SkillEntityResponse {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { SPECIALISATIONS, SPECIALIZATION_ENTITY };
