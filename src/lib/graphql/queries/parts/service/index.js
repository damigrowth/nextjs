import { gql } from "@apollo/client";
import { FREELANCER_PARTIAL } from "../freelancer";
import {
  CATEGORY,
  SUBCATEGORY_ENTITY,
  SUBDIVISION_ENTITY,
} from "../../fragments/taxonomies/service";
import { ADDONS, FAQ, PACKAGES } from "../../fragments/components/pricing";
import { MULTIPLE_FILES, SINGLE_IMAGE, STATUS } from "../../fragments/global";
import { RATING } from "../../fragments/entities/rating";
import { TAG } from "../../fragments/entities/tag";
import {
  FREELANCER_BASIC,
  FREELANCER_SMALL,
} from "../../fragments/entities/freelancer";
import { SERVICE_TYPE } from "../../fragments/components/service";

const SERVICE_MAIN = gql`
  fragment ServiceMain on Service {
    title
    slug
    price
    time
    description
    fixed
    rating
    subscription_type
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
    subcategory {
      data {
        ...SubcategoryEntity
      }
    }
    subdivision {
      data {
        ...SubdivisionEntity
      }
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
      ...MultipleFiles
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
    type {
      ...ServiceType
    }
    seo {
      metaTitle
      metaDescription
    }
  }
  ${FREELANCER_PARTIAL}
  ${CATEGORY}
  ${PACKAGES}
  ${ADDONS}
  ${FAQ}
  ${MULTIPLE_FILES}
  ${STATUS}
  ${RATING}
  ${TAG}
  ${SUBCATEGORY_ENTITY}
  ${SUBDIVISION_ENTITY}
  ${SERVICE_TYPE}
`;

const SERVICE_SEO = gql`
  fragment ServiceSEO on Service {
    title
    slug
    description
    freelancer {
      data {
        attributes {
          firstName
          displayName
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
      ...MultipleFiles
    }
    seo {
      metaTitle
      metaDescription
    }
  }
  ${MULTIPLE_FILES}
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
    subcategory {
      data {
        ...SubcategoryEntity
      }
    }
    media {
      ...MultipleFiles
    }
    freelancer {
      ...FreelancerSmall
    }
  }
  ${CATEGORY}
  ${SUBCATEGORY_ENTITY}
  ${MULTIPLE_FILES}
  ${SINGLE_IMAGE}
  ${FREELANCER_SMALL}
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
      ...MultipleFiles
    }
  }
  ${CATEGORY}
  ${MULTIPLE_FILES}
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
