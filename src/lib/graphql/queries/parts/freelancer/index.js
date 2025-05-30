import { gql } from '@apollo/client';
import {
  BILLING_DETAILS,
  CATEGORY,
  CONTACT_TYPES_FRAGMENT,
  COVERAGE,
  FREELANCER_CATEGORY,
  FREELANCER_SMALL,
  FREELANCER_SUBCATEGORY_PARTIAL,
  FREELANCER_TYPE,
  INDUSTRIES_ENTITY,
  MIN_BUDGET_ENTITY,
  MULTIPLE_FILES,
  ORDERS,
  PAYMENT_METHOD,
  RATING,
  REVIEW_DISLIKES,
  REVIEW_LIKES,
  SERVICES,
  SETTLEMENT_METHOD,
  SINGLE_IMAGE,
  SIZE,
  SKILLS,
  SOCIALS,
  SPECIALIZATION_ENTITY,
  SUBCATEGORY_ENTITY,
  VISIBILITY,
} from '../../fragments';

const FREELANCER_PARTIAL_MAIN = gql`
  fragment FreelancerPartialMain on Freelancer {
    username
    firstName
    lastName
    displayName
    email
    phone
    viber
    whatsapp
    verified
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
    status {
      data {
        id
      }
    }
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
    review_likes {
      ...ReviewLikes
    }
    review_dislikes {
      ...ReviewDislikes
    }
  }
  ${SINGLE_IMAGE}
  ${VISIBILITY}
  ${COVERAGE}
  ${SOCIALS}
  ${FREELANCER_TYPE}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${CONTACT_TYPES_FRAGMENT}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
  ${REVIEW_LIKES}
  ${REVIEW_DISLIKES}
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
    viber
    whatsapp
    verified
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
    status {
      data {
        id
      }
    }
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
    specialization {
      ...SpecializationEntity
    }
    minBudget {
      ...MinBudget
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
    review_likes {
      ...ReviewLikes
    }
    review_dislikes {
      ...ReviewDislikes
    }
    saved_services {
      data {
        id
        attributes {
          title
          slug
          price
          rating
          reviews_total
          media {
            ...MultipleFiles
          }
          category {
            data {
              ...Category
            }
          }
          subcategory {
            data {
              ...SubcategoryEntity
            }
          }
          freelancer {
            ...FreelancerSmall
          }
        }
      }
    }
    saved_freelancers {
      data {
        id
        attributes {
          username
          firstName
          lastName
          displayName
          verified
          topLevel
          rating
          reviews_total
          rate
          visibility {
            ...Visibility
          }
          image {
            ...SingleImage
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
  ${SPECIALIZATION_ENTITY}
  ${MIN_BUDGET_ENTITY}
  ${INDUSTRIES_ENTITY}
  ${CONTACT_TYPES_FRAGMENT}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
  ${MULTIPLE_FILES}
  ${RATING}
  ${REVIEW_LIKES}
  ${REVIEW_DISLIKES}
  ${MULTIPLE_FILES}
  ${CATEGORY}
  ${SUBCATEGORY_ENTITY}
  ${FREELANCER_SMALL}
`;

// New fragment without user field
const FREELANCER_RELATIONS_WITHOUT_USER = gql`
  fragment FreelancerRelationsWithoutUser on Freelancer {
    status {
      data {
        id
      }
    }
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
    specialization {
      ...SpecializationEntity
    }
    minBudget {
      ...MinBudget
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
    review_likes {
      ...ReviewLikes
    }
    review_dislikes {
      ...ReviewDislikes
    }
    saved_services {
      data {
        id
        attributes {
          title
          slug
          price
          rating
          reviews_total
          media {
            ...MultipleFiles
          }
          category {
            data {
              ...Category
            }
          }
          subcategory {
            data {
              ...SubcategoryEntity
            }
          }
          freelancer {
            ...FreelancerSmall
          }
        }
      }
    }
    saved_freelancers {
      data {
        id
        attributes {
          username
          firstName
          lastName
          displayName
          verified
          topLevel
          rating
          reviews_total
          rate
          visibility {
            ...Visibility
          }
          image {
            ...SingleImage
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
    verification {
      data {
        id
        attributes {
          afm
          brandName
          address
          phone
          status {
            data {
              id
              attributes {
                type
              }
            }
          }
        }
      }
    }
    billing_details {
      ...BillingDetails
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
  ${SPECIALIZATION_ENTITY}
  ${MIN_BUDGET_ENTITY}
  ${INDUSTRIES_ENTITY}
  ${CONTACT_TYPES_FRAGMENT}
  ${PAYMENT_METHOD}
  ${SETTLEMENT_METHOD}
  ${MULTIPLE_FILES}
  ${RATING}
  ${REVIEW_LIKES}
  ${REVIEW_DISLIKES}
  ${CATEGORY}
  ${SUBCATEGORY_ENTITY}
  ${FREELANCER_SMALL}
  ${BILLING_DETAILS}
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
  FREELANCER_MAIN,
  FREELANCER_PARTIAL,
  FREELANCER_PARTIAL_MAIN,
  FREELANCER_PARTIAL_RELATIONS,
  FREELANCER_RELATIONS,
  FREELANCER_RELATIONS_WITHOUT_USER,
  FREELANCER_SEO,
};
