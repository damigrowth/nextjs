import { gql } from '@apollo/client';

import { VISIBILITY } from '../../components/global';
import { SINGLE_IMAGE } from '../../global';
import {
  FREELANCER_CATEGORY,
  FREELANCER_SUBCATEGORY_PARTIAL,
} from '../../taxonomies/freelancer';
import { SPECIALIZATION_ENTITY } from '../specialisation';

const FREELANCER_SMALL = gql`
  fragment FreelancerSmall on FreelancerEntityResponse {
    data {
      id
      attributes {
        displayName
        firstName
        lastName
        username
        rating
        reviews_total
        topLevel
        verified
        image {
          ...SingleImage
        }
      }
    }
  }
  ${SINGLE_IMAGE}
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
    firstName
    lastName
    displayName
    email
    phone
    verified
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
    image {
      ...SingleImage
    }
    visibility {
      ...Visibility
    }
    specialization {
      ...SpecializationEntity
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
  ${SPECIALIZATION_ENTITY}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${FREELANCER_TYPE}
`;

export {
  FREELANCER_BASIC,
  FREELANCER_REFERENCE,
  FREELANCER_SMALL,
  FREELANCER_TYPE,
};
