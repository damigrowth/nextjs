import { gql } from "@apollo/client";
import { PAGINATION } from "../../fragments/global";
import {
  FEATURED_SERVICE,
  FEATURED_SERVICE_MAIN,
  FEATURED_SERVICE_RELATIONS,
  SERVICE_MAIN,
  SERVICE_PARTIAL_MAIN,
  SERVICE_PARTIAL_RELATIONS,
  SERVICE_RELATIONS,
  SERVICE_SEO,
} from "../../parts/service";

const SERVICE_BY_SLUG = gql`
  query GetService($slug: String!) {
    services(filters: { slug: { eq: $slug } }) {
      data {
        id
        attributes {
          ...ServiceMain
          ...ServiceRelations
        }
      }
    }
  }
  ${SERVICE_MAIN}
  ${SERVICE_RELATIONS}
`;

const SERVICE_SEO_BY_SLUG = gql`
  query GetServiceSEO($slug: String!) {
    services(filters: { slug: { eq: $slug } }) {
      data {
        attributes {
          ...ServiceSEO
        }
      }
    }
  }
  ${SERVICE_SEO}
`;

const COUNT_SERVICES_BY_RATING = gql`
  query GetServicesCountByRating($ratingId: ID!) {
    services(filters: { rating_global: { id: { eq: $ratingId } } }) {
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

const FEATURED_SERVICES_BY_FREELANCER = gql`
  query featuredServicesByFreelancer(
    $id: IDFilterInput!
    $page: Int
    $pageSize: Int
  ) {
    services(
      sort: "publishedAt:desc"
      filters: { freelancer: { id: $id } }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          ...FeaturedServiceMain
          ...FeaturedServiceRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${FEATURED_SERVICE_MAIN}
  ${FEATURED_SERVICE_RELATIONS}
  ${PAGINATION}
`;

const SERVICE_UID = gql`
  query GetServiceUid($id: ID!) {
    service(id: $id) {
      data {
        id
        attributes {
          title
        }
      }
    }
  }
`;

const FEATURED_SERVICES = gql`
  query FeaturedServices {
    featuredEntity {
      data {
        attributes {
          services {
            ...FeaturedService
          }
        }
      }
    }
  }
  ${FEATURED_SERVICE}
`;

const SERVICES_ARCHIVE = gql`
  query ServicesArchive(
    $search: String
    $min: Int
    $max: Int
    $time: Int
    $cat: String
    $verified: Boolean
    $page: Int
    $sort: [String]
  ) {
    services(
      filters: {
        or: [
          { title: { containsi: $search } }
          { description: { containsi: $search } }
          { category: { label: { containsi: $search } } }
          { category: { subcategories: { label: { containsi: $search } } } }
        ]
        and: [
          { price: { gte: $min, lte: $max } }
          { time: { lte: $time } }
          { category: { slug: { eq: $cat } } }
          { freelancer: { user: { verified: { eq: $verified } } } }
        ]
      }
      sort: $sort
      pagination: { page: $page, pageSize: 20 }
    ) {
      data {
        id
        attributes {
          ...ServicePartialMain
          ...ServicePartialRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${SERVICE_PARTIAL_MAIN}
  ${SERVICE_PARTIAL_RELATIONS}
  ${PAGINATION}
`;

export {
  SERVICE_BY_SLUG,
  SERVICE_SEO_BY_SLUG,
  COUNT_SERVICES_BY_RATING,
  FEATURED_SERVICES_BY_FREELANCER,
  SERVICE_UID,
  FEATURED_SERVICES,
  SERVICES_ARCHIVE,
};