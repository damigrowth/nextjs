import { gql } from '@apollo/client';

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

const BILLING_DETAILS = gql`
  fragment BillingDetails on ComponentPricingBillingDetails {
    receipt
    invoice
    afm
    doy
    brandName
    profession
    address
  }
`;

export {
  ADDONS,
  BASIC_PACKAGE,
  BILLING_DETAILS,
  FAQ,
  PACKAGES,
  PREMIUM_PACKAGE,
  STANDARD_PACKAGE,
};
