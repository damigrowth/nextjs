import { gql } from "@apollo/client";
import { USER_PARTIAL } from "../user";
import { SPECIALISATIONS } from "../specialisation";
import {
  FREELANCER_CATEGORY,
  FREELANCER_SUBCATEGORY,
  FREELANCER_SUBCATEGORY_PARTIAL,
} from "../../taxonomies/freelancer";

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
    subcategory {
      ...FreelancerSubcategoryPartial
    }
  }

  ${USER_PARTIAL}
  ${SPECIALISATIONS}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${FREELANCER_TYPE}
`;

export { FREELANCER_TYPE, FREELANCER_BASIC, FREELANCER_REFERENCE };
