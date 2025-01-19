import { gql } from "@apollo/client";
import { COVERAGE } from "../../fragments/components/location";
import { SOCIALS } from "../../fragments/components/socials";
import { FREELANCER_TYPE } from "../../fragments/entities/freelancer";
import {
  FREELANCER_CATEGORY,
  FREELANCER_SUBCATEGORY_PARTIAL,
} from "../../fragments/taxonomies/freelancer";
import { CONTACT_TYPES } from "../../fragments/entities/contact";
import { PAYMENT_METHOD } from "../../fragments/entities/payment";
import { SETTLEMENT_METHOD } from "../../fragments/entities/settlement";
import { SERVICES } from "../../fragments/entities/service";
import { ORDERS } from "../../fragments/entities/order";
import { SKILLS } from "../../fragments/entities/skill";
import { SIZE } from "../../fragments/entities/size";
import { SPECIALISATIONS } from "../../fragments/entities/specialisation";
import { MIN_BUDGETS } from "../../fragments/entities/budget";
import { INDUSTRIES } from "../../fragments/entities/industry";
import { MULTIPLE_FILES, SINGLE_IMAGE } from "../../fragments/global";
import { RATING } from "../../fragments/entities/rating";
import { VISIBILITY } from "../../fragments/components/global";

const FREELANCER_PARTIAL_MAIN = gql`
  fragment FreelancerPartialMain on Freelancer {
    username
    firstName
    lastName
    displayName
    email
    phone
    verified
    address
    tagline
    rate
    terms
    topLevel
    commencement
    website
    rating
    reviews_total
  }
`;

const FREELANCER_PARTIAL_RELATIONS = gql`
  fragment FreelancerPartialRelations on Freelancer {
    image {
      ...SingleImage
    }
    visibility {
      ...Visibility
    }
    coverage {
      ...Coverage
    }
    type {
      ...FreelancerType
    }
    category {
      ...FreelancerCategory
    }
    subcategory {
      ...FreelancerSubcategoryPartial
    }
    socials {
      ...Socials
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
  }
  ${SINGLE_IMAGE}
  ${VISIBILITY}
  ${COVERAGE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${CONTACT_TYPES}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
`;

const FREELANCER_PARTIAL = gql`
  fragment FreelancerPartial on FreelancerEntityResponse {
    data {
      id
      attributes {
        ...FreelancerPartialMain
        ...FreelancerPartialRelations
      }
    }
  }
  ${FREELANCER_PARTIAL_MAIN}
  ${FREELANCER_PARTIAL_RELATIONS}
`;

const FREELANCER_MAIN = gql`
  fragment FreelancerMain on Freelancer {
    username
    firstName
    lastName
    displayName
    email
    phone
    verified
    address
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
    reviews_total
    rating_stars_1
    rating_stars_2
    rating_stars_3
    rating_stars_4
    rating_stars_5
  }
`;

const FREELANCER_RELATIONS = gql`
  fragment FreelancerRelations on Freelancer {
    image {
      ...SingleImage
    }
    visibility {
      ...Visibility
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
    coverage {
      ...Coverage
    }
    socials {
      ...Socials
    }
    type {
      ...FreelancerType
    }
    category {
      ...FreelancerCategory
    }
    subcategory {
      ...FreelancerSubcategoryPartial
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
      ...MultipleFiles
    }
    rating_global {
      ...Rating
    }
  }
  ${SINGLE_IMAGE}
  ${VISIBILITY}
  ${SERVICES}
  ${ORDERS}
  ${SKILLS}
  ${COVERAGE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${SIZE}
  ${SPECIALISATIONS}
  ${MIN_BUDGETS}
  ${INDUSTRIES}
  ${CONTACT_TYPES}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
  ${MULTIPLE_FILES}
  ${RATING}
`;

// New fragment without user field
const FREELANCER_RELATIONS_WITHOUT_USER = gql`
  fragment FreelancerRelationsWithoutUser on Freelancer {
    image {
      ...SingleImage
    }
    visibility {
      ...Visibility
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
    coverage {
      ...Coverage
    }
    socials {
      ...Socials
    }
    type {
      ...FreelancerType
    }
    category {
      ...FreelancerCategory
    }
    subcategory {
      ...FreelancerSubcategoryPartial
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
      ...MultipleFiles
    }
    rating_global {
      ...Rating
    }
  }
  ${SINGLE_IMAGE}
  ${VISIBILITY}
  ${SERVICES}
  ${ORDERS}
  ${SKILLS}
  ${COVERAGE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${SIZE}
  ${SPECIALISATIONS}
  ${MIN_BUDGETS}
  ${INDUSTRIES}
  ${CONTACT_TYPES}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
  ${MULTIPLE_FILES}
  ${RATING}
`;

const FREELANCER_SEO = gql`
  fragment FreelancerSEO on Freelancer {
    displayName
    description
    tagline
    type {
      data {
        attributes {
          label
        }
      }
    }
    category {
      data {
        attributes {
          label
          plural
        }
      }
    }
    seo {
      metaTitle
      metaDescription
    }
  }
`;

export {
  FREELANCER_PARTIAL_MAIN,
  FREELANCER_PARTIAL_RELATIONS,
  FREELANCER_RELATIONS_WITHOUT_USER,
  FREELANCER_PARTIAL,
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_SEO,
};
