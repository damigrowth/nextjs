import { gql } from "@apollo/client";

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

export { SPECIALIZATION_ENTITY };
