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

const SKILLS_FOR_FILTERED_FREELANCERS = gql`
  query SkillsForFilteredFreelancers(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounty: ID
    $type: String
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $label: String
    $skillsPage: Int
    $skillsPageSize: Int
    $slugs: [String!]
  ) {
    skillsForFilteredResults: skills(
      filters: {
        label: { containsi: $label }
        freelancers: {
          and: [
            { type: { and: [{ slug: { eq: $type } }, { slug: { ne: "user" } }] } }
            { email: { ne: "" } }
            { username: { ne: "" } }
            { displayName: { ne: "" } }
            { rate: { gte: $min, lte: $max } }
            { status: { id: { eq: 1 } } }
            { payment_methods: { id: { in: $paymentMethods } } }
            { contactTypes: { id: { in: $contactTypes } } }
            { coverage: {
              online: { eq: $coverageOnline }
              or: [
                { county: { id: { eq: $coverageCounty } } }
                { areas: { county: { id: { eq: $coverageCounty } } } }
              ]
            } }
            { yearsOfExperience: { gte: $experience } }
            { topLevel: { eq: $top } }
            { verified: { eq: $verified } }
          ]
        }
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
        freelancers: { id: { not: { null: true } } }
      }
    ) {
      ...SkillEntity
    }
  }
  ${PAGINATION}
  ${SKILL_ENTITY}
`;

const SKILLS_FOR_FILTERED_FREELANCERS_WITH_CATEGORY = gql`
  query SkillsForFilteredFreelancersWithCategory(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounty: ID
    $type: String
    $cat: String!
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $label: String
    $skillsPage: Int
    $skillsPageSize: Int
    $slugs: [String!]
  ) {
    skillsForFilteredResults: skills(
      filters: {
        label: { containsi: $label }
        category: { slug: { eq: $cat } }
        freelancers: {
          and: [
            { type: { and: [{ slug: { eq: $type } }, { slug: { ne: "user" } }] } }
            { email: { ne: "" } }
            { username: { ne: "" } }
            { displayName: { ne: "" } }
            { rate: { gte: $min, lte: $max } }
            { status: { id: { eq: 1 } } }
            { payment_methods: { id: { in: $paymentMethods } } }
            { contactTypes: { id: { in: $contactTypes } } }
            { coverage: {
              online: { eq: $coverageOnline }
              or: [
                { county: { id: { eq: $coverageCounty } } }
                { areas: { county: { id: { eq: $coverageCounty } } } }
              ]
            } }
            { category: { id: { ne: null }, slug: { eq: $cat } } }
            { yearsOfExperience: { gte: $experience } }
            { topLevel: { eq: $top } }
            { verified: { eq: $verified } }
          ]
        }
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
        category: { slug: { eq: $cat } }
        freelancers: {
          and: [
            { id: { notNull: true } },
            { category: { id: { ne: null }, slug: { eq: $cat } } }
          ]
        }
      }
    ) {
      ...SkillEntity
    }
  }
  ${PAGINATION}
  ${SKILL_ENTITY}
`;

export { SKILLS_SEARCH, FREELANCER_PROFILE_SKILLS, SKILLS_FOR_FILTERED_FREELANCERS, SKILLS_FOR_FILTERED_FREELANCERS_WITH_CATEGORY };
