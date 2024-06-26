import { gql } from "@apollo/client";

const SERVICES = gql`
  fragment Services on ServiceRelationResponseCollection {
    data {
      id
      attributes {
        title
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

const FREELANCER = gql`
  fragment Freelancer on FreelancerEntityResponse {
    data {
      id
      attributes {
        firstName
        lastName
        displayName
        image {
          data {
            id
            attributes {
              formats
            }
          }
        }
        user {
          data {
            id
            attributes {
              verified
            }
          }
        }
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

const MEDIA_FORMATS = gql`
  fragment MediaFormats on UploadFileRelationResponseCollection {
    data {
      id
      attributes {
        formats
      }
    }
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

const USER_PARTIAL = gql`
  fragment UserPartial on UsersPermissionsUserEntityResponse {
    data {
      id
      attributes {
        displayName
        firstName
        lastName
        image {
          data {
            id
            attributes {
              formats
            }
          }
        }
      }
    }
  }
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

export {
  SERVICES,
  ORDERS,
  SKILLS,
  BASE,
  COVERAGE,
  FREELANCER_TYPE,
  SIZE,
  VERIFICATION,
  SPECIALISATIONS,
  MIN_BUDGETS,
  INDUSTRIES,
  CONTACT_TYPES,
  SOCIALS,
  TAG,
  RATING,
  FREELANCER,
  CATEGORY,
  AREA,
  ADDONS,
  FAQ,
  MEDIA_FORMATS,
  STATUS,
  PACKAGES,
  USER_PARTIAL,
  TYPE,
  LIKES,
  DISLIKES,
};