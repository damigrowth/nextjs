import { gql } from "@apollo/client";

const SERVICE = gql`
  fragment Service on ServiceEntityResponse {
    data {
      id
      attributes {
        title
        slug
      }
    }
  }
`;

const SERVICES = gql`
  fragment Services on ServiceRelationResponseCollection {
    data {
      id
      attributes {
        title
        slug
      }
    }
  }
`;

const SINGLE_IMAGE = gql`
  fragment SingleImage on UploadFileEntityResponse {
    data {
      id
      attributes {
        formats
      }
    }
  }
`;

const VERIFICATION = gql`
  fragment Verification on VerificationEntityResponse {
    data {
      id
      attributes {
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
`;

const SPECIALISATIONS = gql`
  fragment Specialisations on SkillRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const USER_REFERENCE = gql`
  fragment UserReference on UsersPermissionsUserEntityResponse {
    data {
      id
      attributes {
        firstName
        lastName
        displayName
        username
        image {
          ...SingleImage
        }
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const USER_PARTIAL = gql`
  fragment UserPartial on UsersPermissionsUserEntityResponse {
    data {
      id
      attributes {
        firstName
        lastName
        displayName
        email
        phone
        confirmed
        verification {
          ...Verification
        }
        image {
          ...SingleImage
        }
      }
    }
  }
  ${VERIFICATION}
  ${SINGLE_IMAGE}
`;

const PAGINATION = gql`
  fragment Pagination on ResponseCollectionMeta {
    pagination {
      page
      pageSize
      pageCount
      total
    }
  }
`;

const COVERAGE = gql`
  fragment Coverage on ComponentLocationCoverage {
    online
    counties {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const BASE = gql`
  fragment Base on ComponentLocationLocation {
    online
    county {
      data {
        id
        attributes {
          name
        }
      }
    }
    area {
      data {
        id
        attributes {
          name
        }
      }
    }
    zipcode {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const FREELANCER_CATEGORY = gql`
  fragment FreelancerCategory on FreelancerCategoryEntityResponse {
    data {
      id
      attributes {
        label
        plural
        slug
      }
    }
  }
`;

const FREELANCER_TYPE = gql`
  fragment FreelancerType on FreelancerTypeEntityResponse {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const FREELANCER_BASIC = gql`
  fragment FreelancerBasic on Freelancer {
    username
    tagline
    rating
    reviews_total
    rate
    topLevel
    user {
      ...UserPartial
    }
  }
  ${USER_PARTIAL}
`;

const FREELANCER_REFERENCE = gql`
  fragment FreelancerReference on Freelancer {
    username
    tagline
    rating
    reviews_total
    rate
    topLevel
    user {
      ...UserPartial
    }
    specialisations {
      ...Specialisations
    }
    type {
      ...FreelancerType
    }
    category {
      ...FreelancerCategory
    }
  }

  ${USER_PARTIAL}
  ${SPECIALISATIONS}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_TYPE}
`;

const SOCIALS = gql`
  fragment Socials on ComponentSocialsList {
    facebook {
      label
      url
    }
    linkedin {
      label
      url
    }
    x {
      label
      url
    }
    youtube {
      label
      url
    }
    github {
      label
      url
    }
    instagram {
      label
      url
    }
    behance {
      label
      url
    }
    dribbble {
      label
      url
    }
  }
`;

const PAYMENT_METHOD = gql`
  fragment PaymentMethod on PaymentMethodRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const SETTLEMENT_METHOD = gql`
  fragment SettlementMethod on SettlementMethodRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const CONTACT_TYPES = gql`
  fragment ContactTypes on ContactTypeRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const ORDERS = gql`
  fragment Orders on OrderRelationResponseCollection {
    data {
      id
      attributes {
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
`;

const SKILLS = gql`
  fragment Skills on SkillRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const SKILL_ENTITY = gql`
  fragment SkillEntity on SkillEntityResponseCollection {
    data {
      attributes {
        label
        slug
      }
    }
  }
`;
const CATEGORY_ENTITY = gql`
  fragment CategoryEntity on CategoryEntityResponseCollection {
    data {
      attributes {
        label
        slug
      }
    }
  }
`;
const TAG_ENTITY = gql`
  fragment TagEntity on TagEntityResponseCollection {
    data {
      attributes {
        label
        slug
      }
    }
  }
`;
const FREELANCER_CATEGORY_ENTITY = gql`
  fragment FreelancerCategoryEntity on FreelancerCategoryEntityResponseCollection {
    data {
      attributes {
        label
        slug
        plural
      }
    }
  }
`;

const SIZE = gql`
  fragment Size on SizeEntityResponse {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const MIN_BUDGETS = gql`
  fragment MinBudgets on BudgetRelationResponseCollection {
    data {
      id
      attributes {
        value
        label
        slug
      }
    }
  }
`;

const INDUSTRIES = gql`
  fragment Industries on IndustryRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const TAG = gql`
  fragment Tag on TagEntity {
    id
    attributes {
      label
      slug
    }
  }
`;

const CATEGORY = gql`
  fragment Category on CategoryEntity {
    id
    attributes {
      label
      slug
    }
  }
`;

const SUBCATEGORY = gql`
  fragment Subcategory on SubcategoryEntity {
    id
    attributes {
      label
      slug
      category {
        data {
          ...Category
        }
      }
    }
  }
  ${CATEGORY}
`;

const CATEGORY_FULL = gql`
  fragment CategoryFull on CategoryEntity {
    id
    attributes {
      label
      slug
      description
      icon
      image {
        ...SingleImage
      }
      subcategories {
        data {
          ...Subcategory
        }
      }
    }
  }
  ${SINGLE_IMAGE}
  ${SUBCATEGORY}
`;

const FREELANCER_CATEGORY_FULL = gql`
  fragment FreelancerCategoryFull on FreelancerCategoryEntity {
    id
    attributes {
      label
      plural
      slug
      description
      image {
        ...SingleImage
      }
    }
  }
  ${SINGLE_IMAGE}
`;

// TODO: Add id
const RATING = gql`
  fragment Rating on RatingEntityResponse {
    data {
      id
      attributes {
        label
        grade
        slug
      }
    }
  }
`;

const MULTIPLE_IMAGES = gql`
  fragment MultipleImages on UploadFileRelationResponseCollection {
    data {
      id
      attributes {
        formats
      }
    }
  }
`;

const AREA = gql`
  fragment Area on AreaEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const ADDONS = gql`
  fragment Addons on ComponentPricingAddon {
    id
    title
    description
    price
  }
`;

const FAQ = gql`
  fragment Faq on ComponentPricingFaq {
    id
    question
    answer
  }
`;

const STATUS = gql`
  fragment Status on StatusEntityResponse {
    data {
      id
      attributes {
        type
      }
    }
  }
`;

const BASIC_PACKAGE = gql`
  fragment BasicPackage on ComponentPricingBasicPackage {
    id
    title
    basicDesc: description
    price
    features {
      id
      title
      isCheckField
      checked
      value
    }
  }
`;

const STANDARD_PACKAGE = gql`
  fragment StandardPackage on ComponentPricingStandardPackage {
    id
    title
    standardDesc: description
    price
    features {
      id
      title
      isCheckField
      checked
      value
    }
  }
`;

const PREMIUM_PACKAGE = gql`
  fragment PremiumPackage on ComponentPricingPremiumPackage {
    id
    title
    premiumDesc: description
    price
    features {
      id
      title
      isCheckField
      checked
      value
    }
  }
`;

const PACKAGES = gql`
  fragment Packages on ServicePackagesDynamicZone {
    __typename
    ... on ComponentPricingBasicPackage {
      ...BasicPackage
    }
    ... on ComponentPricingStandardPackage {
      ...StandardPackage
    }
    ... on ComponentPricingPremiumPackage {
      ...PremiumPackage
    }
  }
  ${BASIC_PACKAGE}
  ${STANDARD_PACKAGE}
  ${PREMIUM_PACKAGE}
`;

const TYPE = gql`
  fragment Type on TypeEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const LIKES = gql`
  fragment Likes on UsersPermissionsUserRelationResponseCollection {
    data {
      id
    }
  }
`;

const DISLIKES = gql`
  fragment Dislikes on UsersPermissionsUserRelationResponseCollection {
    data {
      id
    }
  }
`;

const REVIEW_LIKES = gql`
  fragment ReviewLikes on ReviewRelationResponseCollection {
    data {
      id
    }
  }
`;

const REVIEW_DISLIKES = gql`
  fragment ReviewDislikes on ReviewRelationResponseCollection {
    data {
      id
    }
  }
`;

const ROLE = gql`
  fragment Role on UsersPermissionsRoleEntityResponse {
    data {
      id
      attributes {
        type
        name
      }
    }
  }
`;

export {
  SERVICE,
  SERVICES,
  ORDERS,
  SKILLS,
  BASE,
  COVERAGE,
  FREELANCER_TYPE,
  FREELANCER_CATEGORY,
  FREELANCER_CATEGORY_FULL,
  SIZE,
  VERIFICATION,
  SPECIALISATIONS,
  MIN_BUDGETS,
  INDUSTRIES,
  CONTACT_TYPES,
  SOCIALS,
  TAG,
  RATING,
  CATEGORY,
  SUBCATEGORY,
  CATEGORY_FULL,
  AREA,
  ADDONS,
  FAQ,
  SINGLE_IMAGE,
  MULTIPLE_IMAGES,
  STATUS,
  PACKAGES,
  USER_PARTIAL,
  TYPE,
  LIKES,
  DISLIKES,
  REVIEW_LIKES,
  REVIEW_DISLIKES,
  ROLE,
  PAYMENT_METHOD,
  SETTLEMENT_METHOD,
  PAGINATION,
  USER_REFERENCE,
  FREELANCER_REFERENCE,
  FREELANCER_BASIC,
  SKILL_ENTITY,
  CATEGORY_ENTITY,
  TAG_ENTITY,
  FREELANCER_CATEGORY_ENTITY,
};
