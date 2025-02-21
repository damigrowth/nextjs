import { SKILL_ENTITY } from "@/lib/graphql/queries/fragments/entities/skill";
import { PAGINATION } from "@/lib/graphql/queries/fragments/global";
import { gql } from "@apollo/client";

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
        freelancers: { id: { not: { null: true } } }
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
      filters: {
        slug: { in: $slugs }
        category: { slug: { eq: $category } }
        freelancers: { id: { not: { null: true } } }
      }
    ) {
      ...SkillEntity
    }
  }
  ${PAGINATION}
  ${SKILL_ENTITY}
`;

const FREELANCER_PROFILE_SKILLS = gql`
  query FreelancerProfileSkills(
    $label: String
    $categorySlug: String
    $skillsPage: Int
    $skillsPageSize: Int
  ) {
    skills(
      filters: {
        label: { containsi: $label }
        category: { slug: { eq: $categorySlug } }
      }
      pagination: { page: $skillsPage, pageSize: $skillsPageSize }
      sort: "label:asc"
    ) {
      ...SkillEntity
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
  ${SKILL_ENTITY}
`;

export { SKILLS_SEARCH, FREELANCER_PROFILE_SKILLS };
