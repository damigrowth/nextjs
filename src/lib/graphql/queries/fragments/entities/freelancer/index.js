import { gql } from "@apollo/client";
import { SPECIALISATIONS } from "../specialisation";
import {
  FREELANCER_CATEGORY,
  FREELANCER_SUBCATEGORY_PARTIAL,
} from "../../taxonomies/freelancer";
import { SINGLE_IMAGE } from "../../global";
import { VISIBILITY } from "../../components/global";

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
    firstName
    lastName
    displayName
    email
    phone
    verified
    address
    image {
      ...SingleImage
    }
    visibility {
      ...Visibility
    }
    tagline
    rating
    reviews_total
    rate
    topLevel
  }
  ${SINGLE_IMAGE}
  ${VISIBILITY}
`;

const FREELANCER_REFERENCE = gql`
  fragment FreelancerReference on Freelancer {
    username
    tagline
    rating
    reviews_total
    rate
    topLevel
    firstName
    lastName
    displayName
    email
    phone
    verified
    address
    image {
      ...SingleImage
    }
    visibility {
      ...Visibility
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

  ${SINGLE_IMAGE}
  ${VISIBILITY}
  ${SPECIALISATIONS}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${FREELANCER_TYPE}
`;

export { FREELANCER_TYPE, FREELANCER_BASIC, FREELANCER_REFERENCE };
