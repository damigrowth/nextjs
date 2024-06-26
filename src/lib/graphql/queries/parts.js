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
  REVIEW_LIKES,
  REVIEW_DISLIKES,
  MULTIPLE_IMAGES,
  ROLE,
  SINGLE_IMAGE,
  PAYMENT_METHOD,
  SETTLEMENT_METHOD,
} from "./fragments";

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

const FREELANCER_MAIN = gql`
  fragment FreelancerMain on Freelancer {
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
    rating
  }
`;

const FREELANCER_RELATIONS = gql`
  fragment FreelancerRelations on Freelancer {
    user {
      ...UserPartial
    }
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
    payment_methods {
      ...PaymentMethod
    }
    settlement_methods {
      ...SettlementMethod
    }
    portfolio {
      ...MultipleImages
    }
    rating_global {
      ...Rating
    }
  }
  ${USER_PARTIAL}
  ${SERVICES}
  ${ORDERS}
  ${SKILLS}
  ${BASE}
  ${COVERAGE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${SIZE}
  ${SPECIALISATIONS}
  ${MIN_BUDGETS}
  ${INDUSTRIES}
  ${CONTACT_TYPES}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
  ${MULTIPLE_IMAGES}
  ${RATING}
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
      ...MultipleImages
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
  ${MULTIPLE_IMAGES}
  ${STATUS}
  ${RATING}
  ${TAG}
`;

const USER_MAIN = gql`
  fragment UserMain on UsersPermissionsUser {
    username
    email
    phone
    confirmed
    firstName
    lastName
    displayName
    image {
      ...SingleImage
    }
    freelancer {
      data {
        id
      }
    }
    verification {
      ...Verification
    }
  }
  ${SINGLE_IMAGE}
  ${VERIFICATION}
`;

const USER_RELATIONS = gql`
  fragment UserRelations on UsersPermissionsUser {
    role {
      ...Role
    }
    review_likes {
      ...ReviewLikes
    }
    review_dislikes {
      ...ReviewDislikes
    }
    reviews_given {
      ...Review
    }
    orders {
      ...Orders
    }
    viewed {
      data {
        id
      }
    }
  }
  ${ROLE}
  ${REVIEW_LIKES}
  ${REVIEW_DISLIKES}
  ${REVIEW}
  ${ORDERS}
`;

const FEATURED_SERVICE_MAIN = gql`
  fragment FeaturedServiceMain on Service {
    title
    price
    rating
    slug
  }
`;

const FEATURED_SERVICE_RELATIONS = gql`
  fragment FeaturedServiceRelations on Service {
    packages {
      __typename
      ... on ComponentPricingBasicPackage {
        price
      }
    }
    category {
      data {
        ...Category
      }
    }
    media {
      ...MultipleImages
    }
  }
  ${CATEGORY}
  ${MULTIPLE_IMAGES}
`;

export {
  USER_MAIN,
  USER_RELATIONS,
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  REVIEW_MAIN,
  REVIEW_RELATIONS,
  REVIEW,
  SERVICE_MAIN,
  SERVICE_RELATIONS,
  FEATURED_SERVICE_MAIN,
  FEATURED_SERVICE_RELATIONS,
};
