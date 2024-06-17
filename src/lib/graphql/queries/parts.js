import { gql } from "@apollo/client";
import {
  SERVICES,
  ORDERS,
  SKILLS,
  BASE,
  COVERAGE,
  SIZE,
  VERIFICATION,
  SPECIALISATIONS,
  MIN_BUDGETS,
  INDUSTRIES,
  CONTACT_TYPES,
  SOCIALS,
  FREELANCER,
  CATEGORY,
  AREA,
  PACKAGES,
  ADDONS,
  FAQ,
  MEDIA_FORMATS,
  STATUS,
  RATING,
  TAG,
  FREELANCER_TYPE,
  USER_PARTIAL,
  TYPE,
  LIKES,
  DISLIKES,
} from "./fragments";

const FREELANCER_MAIN = gql`
  fragment FreelancerMain on Freelancer {
    firstName
    lastName
    displayName
    username
    website
    tagline
    rate
    commencement
    yearsOfExperience
    description
    rating
    topLevel
    terms
  }
`;

const FREELANCER_RELATIONS = gql`
  fragment FreelancerRelations on Freelancer {
    services {
      ...Services
    }
    orders {
      ...Orders
    }
    skills {
      ...Skills
    }
    base {
      ...Base
    }
    coverage {
      ...Coverage
    }
    socials {
      ...Socials
    }
    type {
      ...FreelancerType
    }
    size {
      ...Size
    }
    verification {
      ...Verification
    }
    specialisations {
      ...Specialisations
    }
    minBudgets {
      ...MinBudgets
    }
    industries {
      ...Industries
    }
    contactTypes {
      ...ContactTypes
    }
  }
  ${SERVICES}
  ${ORDERS}
  ${SKILLS}
  ${BASE}
  ${COVERAGE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${SIZE}
  ${VERIFICATION}
  ${SPECIALISATIONS}
  ${MIN_BUDGETS}
  ${INDUSTRIES}
  ${CONTACT_TYPES}
`;

const REVIEW_MAIN = gql`
  fragment ReviewMain on Review {
    rating
    comment
    createdAt
    updatedAt
    publishedAt
  }
`;

const REVIEW_RELATIONS = gql`
  fragment ReviewRelations on Review {
    user {
      ...UserPartial
    }
    type {
      ...Type
    }
    status {
      ...Status
    }
    likes {
      ...Likes
    }
    dislikes {
      ...Dislikes
    }
  }
  ${USER_PARTIAL}
  ${TYPE}
  ${STATUS}
  ${LIKES}
  ${DISLIKES}
`;

const REVIEW = gql`
  fragment Review on ReviewRelationResponseCollection {
    data {
      id
      attributes {
        ...ReviewMain
        ...ReviewRelations
      }
    }
  }
  ${REVIEW_MAIN}
  ${REVIEW_RELATIONS}
`;

const SERVICE_MAIN = gql`
  fragment ServiceMain on Service {
    title
    price
    time
    description
    fixed
    rating
    slug
  }
`;

const SERVICE_RELATIONS = gql`
  fragment ServiceRelations on Service {
    freelancer {
      ...Freelancer
    }
    category {
      data {
        ...Category
      }
    }
    area {
      ...Area
    }
    skills {
      ...Skills
    }
    packages {
      ...Packages
    }
    addons {
      ...Addons
    }
    faq {
      ...Faq
    }
    media {
      ...MediaFormats
    }
    status {
      ...Status
    }
    rating_global {
      ...Rating
    }
    tags {
      data {
        ...Tag
      }
    }
    reviews {
      ...Review
    }
    seo {
      metaTitle
      metaDescription
    }
  }
  ${FREELANCER}
  ${CATEGORY}
  ${AREA}
  ${SKILLS}
  ${PACKAGES}
  ${ADDONS}
  ${FAQ}
  ${MEDIA_FORMATS}
  ${STATUS}
  ${RATING}
  ${TAG}
  ${REVIEW}
`;

export {
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  REVIEW_MAIN,
  REVIEW_RELATIONS,
  REVIEW,
  SERVICE_MAIN,
  SERVICE_RELATIONS,
};
