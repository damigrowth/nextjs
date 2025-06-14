import { gql } from '@apollo/client';

import {
  FREELANCER_CATEGORY,
  FREELANCER_REFERENCE,
  FREELANCER_SUBCATEGORY_PARTIAL,
  PAGINATION,
  SINGLE_IMAGE,
  SPECIALIZATION_ENTITY,
} from '../../fragments';
import {
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_SEO,
} from '../../parts';

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
        subcategory: { id: { ne: null }, slug: { eq: $sub } }
        yearsOfExperience: { gte: $experience }
        topLevel: { eq: $top }
        verified: { eq: $verified }
        or: [
          { coverage: { county: { id: { eq: $coverageCounty } } } }
          { coverage: { areas: { county: { id: { eq: $coverageCounty } } } } }
        ]
      }
      sort: $sort
      pagination: { page: $page, pageSize: 21 }
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
        skills: { slug: { in: $skills } }
        subcategory: { id: { ne: null }, slug: { eq: $sub } }
        yearsOfExperience: { gte: $experience }
        topLevel: { eq: $top }
        verified: { eq: $verified }
        or: [
          { coverage: { county: { id: { eq: $coverageCounty } } } }
          { coverage: { areas: { county: { id: { eq: $coverageCounty } } } } }
        ]
      }
      sort: $sort
      pagination: { page: $page, pageSize: 21 }
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
  query FeaturedFreelancers(
    $page: Int = 1
    $pageSize: Int = 4
  ) {
    freelancers(
      filters: {
        type: { slug: { ne: "user" } }
        email: { ne: "" }
        username: { ne: "" }
        displayName: { ne: "" }
        status: { id: { eq: 1 } }
        category: { id: { ne: null } }
        subcategory: { id: { ne: null } }
        featured: { eq: true }
      }
      pagination: { page: $page, pageSize: $pageSize }
      sort: "updatedAt:desc"
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
      meta {
        ...Pagination
      }
    }
  }
  ${SINGLE_IMAGE}
  ${SPECIALIZATION_ENTITY}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${PAGINATION}
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
  COUNT_FREELANCERS_BY_RATING,
  FEATURED_FREELANCERS,
  FREELANCER_BY_ID,
  FREELANCER_BY_USERNAME,
  FREELANCER_ID,
  FREELANCER_NOTIFICATIONS,
  FREELANCER_PAGE_SEO,
  FREELANCER_TYPES,
  FREELANCERS_ALL,
  FREELANCERS_ARCHIVE,
  FREELANCERS_ARCHIVE_WITH_SKILLS,
};
