import { gql } from "@apollo/client";
import { SINGLE_IMAGE } from "../../global";

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

export {
  FREELANCER_CATEGORY,
  FREELANCER_CATEGORY_ENTITY,
  FREELANCER_CATEGORY_FULL,
};
