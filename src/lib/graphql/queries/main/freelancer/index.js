import { gql } from "@apollo/client";
import {
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_SEO,
} from "../../parts/freelancer";
import { PAGINATION, SINGLE_IMAGE } from "../../fragments/global";
import { FREELANCER_REFERENCE } from "../../fragments/entities/freelancer";
import {
  FREELANCER_CATEGORY,
  FREELANCER_SUBCATEGORY_PARTIAL,
} from "../../fragments/taxonomies/freelancer";
import { SPECIALIZATION_ENTITY } from "../../fragments/entities/specialisation";

const FREELANCER_ID = gql`
  query FreelancerId($id: ID!) {
    freelancers(filters: { user: { id: { eq: $id } } }) {
      data {
        id
      }
    }
  }
`;

const FREELANCER_TYPES = gql`
  query FreelancerTypes {
    freelancerTypes {
      data {
        id
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const FREELANCER_BY_ID = gql`
  query GetFreelancer($id: ID!) {
    freelancers(filters: { user: { id: { eq: $id } } }) {
      data {
        id
        attributes {
          ...FreelancerMain
          ...FreelancerRelations
        }
      }
    }
  }
  ${FREELANCER_MAIN}
  ${FREELANCER_RELATIONS}
`;

const FREELANCER_BY_USERNAME = gql`
  query GetFreelancer($username: String!) {
    freelancers(
      filters: {
        username: { eq: $username }
        email: { ne: "" }
        displayName: { ne: "" }
        status: { id: { eq: 1 } }
        type: { slug: { ne: "user" } }
        category: { id: { ne: null } }
        subcategory: { id: { ne: null } }
      }
    ) {
      data {
        id
        attributes {
          ...FreelancerMain
          ...FreelancerRelations
        }
      }
    }
  }
  ${FREELANCER_MAIN}
  ${FREELANCER_RELATIONS}
`;

const FREELANCER_PAGE_SEO = gql`
  query GetFreelancerSEO($username: String!) {
    freelancer: freelancers(filters: { username: { eq: $username } }) {
      data {
        attributes {
          ...FreelancerSEO
        }
      }
    }
  }
  ${FREELANCER_SEO}
`;

const COUNT_FREELANCERS_BY_RATING = gql`
  query GetFreelancersCountByRating($ratingId: ID!) {
    freelancers(filters: { rating_global: { id: { eq: $ratingId } } }) {
      data {
        id
      }
      meta {
        pagination {
          total
        }
      }
    }
  }
`;

const FREELANCERS_ARCHIVE = gql`
  query FreelancersArchive(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounty: ID
    $type: String
    $cat: String
    $sub: String
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $sort: [String]
    $page: Int
  ) {
    freelancers(
      filters: {
        and: [
          { type: { and: [{ slug: { eq: $type } }, { slug: { ne: "user" } }] } }
          { email: { ne: "" } }
          { username: { ne: "" } }
          { displayName: { ne: "" } }
          { rate: { gte: $min, lte: $max } }
          { status: { id: { eq: 1 } } }
          { payment_methods: { id: { in: $paymentMethods } } }
          { contactTypes: { id: { in: $contactTypes } } }
          {
            coverage: {
              online: { eq: $coverageOnline }
              or: [
                { county: { id: { eq: $coverageCounty } } }
                { areas: { county: { id: { eq: $coverageCounty } } } }
              ]
            }
          }
          { category: { id: { ne: null }, slug: { eq: $cat } } }
          { subcategory: { id: { ne: null }, slug: { eq: $sub } } }
          { yearsOfExperience: { gte: $experience } }
          { topLevel: { eq: $top } }
          { verified: { eq: $verified } }
        ]
      }
      sort: $sort
      pagination: { page: $page, pageSize: 20 }
    ) {
      data {
        id
        attributes {
          ...FreelancerReference
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
  ${FREELANCER_REFERENCE}
`;

const FREELANCERS_ARCHIVE_WITH_SKILLS = gql`
  query FreelancersArchiveWithSkills(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounty: ID
    $type: String
    $cat: String
    $skills: [String]
    $sub: String
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $sort: [String]
    $page: Int
  ) {
    freelancers(
      filters: {
        and: [
          { type: { and: [{ slug: { eq: $type } }, { slug: { ne: "user" } }] } }
          { email: { ne: "" } }
          { username: { ne: "" } }
          { displayName: { ne: "" } }
          { rate: { gte: $min, lte: $max } }
          { status: { id: { eq: 1 } } }
          { payment_methods: { id: { in: $paymentMethods } } }
          { contactTypes: { id: { in: $contactTypes } } }
          {
            coverage: {
              online: { eq: $coverageOnline }
              or: [
                { county: { id: { eq: $coverageCounty } } }
                { areas: { county: { id: { eq: $coverageCounty } } } }
              ]
            }
          }
          { category: { id: { ne: null }, slug: { eq: $cat } } }
          { skills: { slug: { in: $skills } } }
          { subcategory: { id: { ne: null }, slug: { eq: $sub } } }
          { yearsOfExperience: { gte: $experience } }
          { topLevel: { eq: $top } }
          { verified: { eq: $verified } }
        ]
      }
      sort: $sort
      pagination: { page: $page, pageSize: 20 }
    ) {
      data {
        id
        attributes {
          ...FreelancerReference
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
  ${FREELANCER_REFERENCE}
`;

const FEATURED_FREELANCERS = gql`
  query FeaturedFreelancers {
    featuredEntity {
      data {
        attributes {
          freelancers(
            filters: {
              type: { slug: { ne: "user" } }
              email: { ne: "" }
              username: { ne: "" }
              displayName: { ne: "" }
              status: { id: { eq: 1 } }
              category: { id: { ne: null } }
              subcategory: { id: { ne: null } }
            }
          ) {
            data {
              id
              attributes {
                username
                firstName
                lastName
                displayName
                rating
                reviews_total
                topLevel
                verified
                image {
                  ...SingleImage
                }
                specialization {
                  ...SpecializationEntity
                }
                category {
                  ...FreelancerCategory
                }
                subcategory {
                  ...FreelancerSubcategoryPartial
                }
              }
            }
          }
        }
      }
    }
  }
  ${SINGLE_IMAGE}
  ${SPECIALIZATION_ENTITY}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
`;

const FREELANCERS_ALL = gql`
  query FreelancersAll {
    allFreelancers: freelancers(
      filters: {
        type: { slug: { ne: "user" } }
        email: { ne: "" }
        username: { ne: "" }
        displayName: { ne: "" }
        status: { id: { eq: 1 } }
      }
      pagination: { page: 1, pageSize: 1000 }
    ) {
      data {
        attributes {
          username
        }
      }
    }
  }
`;

const FREELANCER_NOTIFICATIONS = gql`
  query FreelancerNotifications($freelancerId: ID!) {
    notifications(filters: { freelancer: { id: { eq: $freelancerId } } }) {
      data {
        id
        attributes {
          freelancer {
            data {
              id
            }
          }
          totalUnreadCount
        }
      }
    }
  }
`;

export {
  FREELANCER_ID,
  FREELANCER_TYPES,
  FREELANCER_BY_ID,
  FREELANCER_BY_USERNAME,
  FREELANCER_PAGE_SEO,
  COUNT_FREELANCERS_BY_RATING,
  FREELANCERS_ARCHIVE,
  FREELANCERS_ARCHIVE_WITH_SKILLS,
  FEATURED_FREELANCERS,
  FREELANCERS_ALL,
  FREELANCER_NOTIFICATIONS,
};
