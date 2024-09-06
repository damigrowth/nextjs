import { gql } from "@apollo/client";
import { USER_PARTIAL } from "../../fragments/entities/user";
import { BASE, COVERAGE } from "../../fragments/components/location";
import { SOCIALS } from "../../fragments/components/socials";
import { FREELANCER_TYPE } from "../../fragments/entities/freelancer";
import { FREELANCER_CATEGORY } from "../../fragments/taxonomies/freelancer";
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
import { MULTIPLE_IMAGES } from "../../fragments/global";
import { RATING } from "../../fragments/entities/rating";

const FREELANCER_PARTIAL_MAIN = gql`
  fragment FreelancerPartialMain on Freelancer {
    tagline
    rate
    username
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
    user {
      ...UserPartial
    }
    base {
      ...Base
    }
    type {
      ...FreelancerType
    }
    category {
      ...FreelancerCategory
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
  ${USER_PARTIAL}
  ${BASE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${FREELANCER_CATEGORY}
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
    category {
      ...FreelancerCategory
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
  ${FREELANCER_CATEGORY}
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

const FREELANCER_SEO = gql`
  fragment FreelancerSEO on Freelancer {
    user {
      data {
        attributes {
          displayName
        }
      }
    }
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
  FREELANCER_PARTIAL,
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_SEO,
};