import { gql } from "@apollo/client";

const {
  SKILL_ENTITY,
} = require("@/lib/graphql/queries/fragments/entities/skill");
const { PAGINATION } = require("@/lib/graphql/queries/fragments/global");

const SKILLS_SEARCH = gql`
  query SkillsSearch(
    $label: String
    $category: String
    $skillsPage: Int
    $skillsPageSize: Int
    $slugs: [String!]
  ) {
    skillsBySearch: skills(
      filters: {
        label: { containsi: $label }
        category: { slug: { eq: $category } }
      }
      pagination: { page: $skillsPage, pageSize: $skillsPageSize }
      sort: "label:asc"
    ) {
      ...SkillEntity
      meta {
        ...Pagination
      }
    }
    skillsBySlug: skills(
      filters: { slug: { in: $slugs }, category: { slug: { eq: $category } } }
    ) {
      ...SkillEntity
    }
  }
  ${PAGINATION}
  ${SKILL_ENTITY}
`;

export { SKILLS_SEARCH };
