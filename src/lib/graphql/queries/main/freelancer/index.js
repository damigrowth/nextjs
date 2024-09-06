import { gql } from "@apollo/client";
import {
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_SEO,
} from "../../parts/freelancer";
import { PAGINATION } from "../../fragments/global";
import { FREELANCER_REFERENCE } from "../../fragments/entities/freelancer";

const FREELANCER_TYPES = gql`
  query FreelancerTypes {
    freelancerTypes {
      data {
        id
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const FREELANCER_BY_USERNAME = gql`
  query GetFreelancer($username: String!) {
    freelancers(filters: { username: { eq: $username } }) {
      data {
        id
        attributes {
          ...FreelancerMain
          ...FreelancerRelations
        }
      }
    }
  }
  ${FREELANCER_MAIN}
  ${FREELANCER_RELATIONS}
`;

const FREELANCER_SEO_BY_USERNAME = gql`
  query GetFreelancerSEO($username: String!) {
    freelancers(filters: { username: { eq: $username } }) {
      data {
        attributes {
          ...FreelancerSEO
        }
      }
    }
  }
  ${FREELANCER_SEO}
`;

const COUNT_FREELANCERS_BY_RATING = gql`
  query GetFreelancersCountByRating($ratingId: ID!) {
    freelancers(filters: { rating_global: { id: { eq: $ratingId } } }) {
      data {
        id
      }
      meta {
        pagination {
          total
        }
      }
    }
  }
`;

const FREELANCERS_ARCHIVE = gql`
  query FreelancersArchive(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounties: [ID]
    $type: String
    $cat: String
    $specializations: [ID]
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $sort: [String]
    $page: Int
  ) {
    freelancers(
      filters: {
        type: { slug: { eq: $type } }
        rate: { gte: $min, lte: $max }
        payment_methods: { id: { in: $paymentMethods } }
        contactTypes: { id: { in: $contactTypes } }
        coverage: {
          online: { eq: $coverageOnline }
          counties: { id: { in: $coverageCounties } }
        }
        category: { slug: { eq: $cat } }
        specialisations: { id: { in: $specializations } }
        yearsOfExperience: { gte: $experience }
        topLevel: { eq: $top }
        user: { verified: { eq: $verified } }
      }
      sort: $sort
      pagination: { page: $page, pageSize: 20 }
    ) {
      data {
        id
        attributes {
          ...FreelancerReference
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
  ${FREELANCER_REFERENCE}
`;

const FEATURED_FREELANCERS = gql`
  query FeaturedFreelancers {
    featuredEntity {
      data {
        attributes {
          freelancers {
            data {
              attributes {
                ...FreelancerReference
              }
            }
          }
        }
      }
    }
  }
  ${FREELANCER_REFERENCE}
`;

export {
  FREELANCER_TYPES,
  FREELANCER_BY_USERNAME,
  FREELANCER_SEO_BY_USERNAME,
  COUNT_FREELANCERS_BY_RATING,
  FREELANCERS_ARCHIVE,
  FEATURED_FREELANCERS,
};