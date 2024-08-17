import { gql } from "@apollo/client";
import { FREELANCER_PARTIAL } from "../freelancer";
import { CATEGORY } from "../../fragments/taxonomies/service";
import { AREA } from "../../fragments/entities/location";
import { ADDONS, FAQ, PACKAGES } from "../../fragments/components/pricing";
import { MULTIPLE_IMAGES, STATUS } from "../../fragments/global";
import { RATING } from "../../fragments/entities/rating";
import { TAG } from "../../fragments/entities/tag";
import { FREELANCER_BASIC } from "../../fragments/entities/freelancer";

const SERVICE_MAIN = gql`
  fragment ServiceMain on Service {
    title
    slug
    price
    time
    description
    fixed
    rating
    reviews_total
    rating_stars_1
    rating_stars_2
    rating_stars_3
    rating_stars_4
    rating_stars_5
  }
`;

const SERVICE_RELATIONS = gql`
  fragment ServiceRelations on Service {
    freelancer {
      ...FreelancerPartial
    }
    category {
      data {
        ...Category
      }
    }
    area {
      ...Area
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
  ${FREELANCER_PARTIAL}
  ${CATEGORY}
  ${AREA}
  ${PACKAGES}
  ${ADDONS}
  ${FAQ}
  ${MULTIPLE_IMAGES}
  ${STATUS}
  ${RATING}
  ${TAG}
`;

const SERVICE_SEO = gql`
  fragment ServiceSEO on Service {
    title
    slug
    description
    freelancer {
      data {
        attributes {
          user {
            data {
              attributes {
                firstName
                displayName
              }
            }
          }
        }
      }
    }
    category {
      data {
        attributes {
          label
        }
      }
    }
    media {
      ...MultipleImages
    }
    seo {
      metaTitle
      metaDescription
    }
  }
  ${MULTIPLE_IMAGES}
`;

const SERVICE_PARTIAL_MAIN = gql`
  fragment ServicePartialMain on Service {
    title
    price
    rating
    reviews_total
    slug
  }
`;

const SERVICE_PARTIAL_RELATIONS = gql`
  fragment ServicePartialRelations on Service {
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
    freelancer {
      data {
        id
        attributes {
          ...FreelancerBasic
        }
      }
    }
  }
  ${CATEGORY}
  ${MULTIPLE_IMAGES}
  ${FREELANCER_BASIC}
`;

const SERVICE_PARTIAL = gql`
  fragment ServicePartial on ServiceEntityResponseCollection {
    data {
      id
      attributes {
        ...ServicePartialMain
        ...ServicePartialRelations
      }
    }
  }
  ${SERVICE_PARTIAL_MAIN}
  ${SERVICE_PARTIAL_RELATIONS}
`;

const FEATURED_SERVICE_MAIN = gql`
  fragment FeaturedServiceMain on Service {
    title
    price
    rating
    reviews_total
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

const FEATURED_SERVICE = gql`
  fragment FeaturedService on ServiceRelationResponseCollection {
    data {
      id
      attributes {
        ...ServicePartialMain
        ...ServicePartialRelations
      }
    }
  }
  ${SERVICE_PARTIAL_MAIN}
  ${SERVICE_PARTIAL_RELATIONS}
`;

export {
  SERVICE_MAIN,
  SERVICE_RELATIONS,
  SERVICE_SEO,
  SERVICE_PARTIAL_MAIN,
  SERVICE_PARTIAL_RELATIONS,
  SERVICE_PARTIAL,
  FEATURED_SERVICE_MAIN,
  FEATURED_SERVICE_RELATIONS,
  FEATURED_SERVICE,
};
