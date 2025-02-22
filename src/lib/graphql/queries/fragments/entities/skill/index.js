import { gql } from "@apollo/client";

const SKILLS = gql`
  fragment Skills on SkillRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const SKILL_ENTITY = gql`
  fragment SkillEntity on SkillEntityResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { SKILLS, SKILL_ENTITY };
