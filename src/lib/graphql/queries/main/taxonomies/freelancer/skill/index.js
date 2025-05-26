import { PAGINATION, SKILL_ENTITY } from '@/lib/graphql/queries/fragments';
import { gql } from '@apollo/client';

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

// Fixed SKILLS_FOR_FILTERED_FREELANCERS query
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
        and: [
          {
            freelancers: {
              type: { slug: { eq: $type, ne: "user" } }
              email: { ne: "" }
              username: { ne: "" }
              displayName: { ne: "" }
              rate: { gte: $min, lte: $max }
              status: { id: { eq: 1 } }
              payment_methods: { id: { in: $paymentMethods } }
              contactTypes: { id: { in: $contactTypes } }
              coverage: { online: { eq: $coverageOnline } }
              yearsOfExperience: { gte: $experience }
              topLevel: { eq: $top }
              verified: { eq: $verified }
            }
          }
          {
            or: [
              {
                freelancers: {
                  coverage: { county: { id: { eq: $coverageCounty } } }
                }
              }
              {
                freelancers: {
                  coverage: {
                    areas: { county: { id: { eq: $coverageCounty } } }
                  }
                }
              }
            ]
          }
        ]
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

// Fixed SKILLS_FOR_FILTERED_FREELANCERS_WITH_CATEGORY query
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
        and: [
          {
            freelancers: {
              type: { slug: { eq: $type, ne: "user" } }
              email: { ne: "" }
              username: { ne: "" }
              displayName: { ne: "" }
              rate: { gte: $min, lte: $max }
              status: { id: { eq: 1 } }
              payment_methods: { id: { in: $paymentMethods } }
              contactTypes: { id: { in: $contactTypes } }
              coverage: { online: { eq: $coverageOnline } }
              category: { id: { ne: null }, slug: { eq: $cat } }
              yearsOfExperience: { gte: $experience }
              topLevel: { eq: $top }
              verified: { eq: $verified }
            }
          }
          {
            or: [
              {
                freelancers: {
                  coverage: { county: { id: { eq: $coverageCounty } } }
                }
              }
              {
                freelancers: {
                  coverage: {
                    areas: { county: { id: { eq: $coverageCounty } } }
                  }
                }
              }
            ]
          }
        ]
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
          id: { notNull: true }
          category: { id: { ne: null }, slug: { eq: $cat } }
        }
      }
    ) {
      ...SkillEntity
    }
  }
  ${PAGINATION}
  ${SKILL_ENTITY}
`;

export {
  FREELANCER_PROFILE_SKILLS,
  SKILLS_FOR_FILTERED_FREELANCERS,
  SKILLS_FOR_FILTERED_FREELANCERS_WITH_CATEGORY,
  SKILLS_SEARCH,
};
