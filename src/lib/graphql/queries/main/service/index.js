import { gql } from "@apollo/client";
import { MULTIPLE_FILES, PAGINATION } from "../../fragments/global";
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
import {
  CATEGORY,
  SUBCATEGORY_ENTITY,
  SUBDIVISION_ENTITY,
} from "../../fragments/taxonomies/service";

const SERVICE_BY_ID = gql`
  query ServiceById($id: ID!) {
    service(id: $id) {
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

const SERVICE_PAGE_SEO = gql`
  query GetServiceSEO($id: ID!) {
    service(id: $id) {
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
      filters: { freelancer: { id: $id }, status: { type: { eq: "Active" } } }
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
          services(filters: { status: { type: { eq: "Active" } } }) {
            ...FeaturedService
          }
        }
      }
    }
  }
  ${FEATURED_SERVICE}
`;

// TODO: Add $search for tags
const SERVICES_ARCHIVE = gql`
  query ServicesArchive(
    $search: String
    $min: Int
    $max: Int
    $time: Int
    $cat: String
    $tags: [String]
    $verified: Boolean
    $page: Int
    $sort: [String]
  ) {
    services(
      filters: {
        or: [
          { title_normalized: { containsi: $search } }
          { description_normalized: { containsi: $search } }
          { category: { label_normalized: { containsi: $search } } }
          { subcategory: { label_normalized: { containsi: $search } } }
          { subdivision: { label_normalized: { containsi: $search } } }
          { tags: { label_normalized: { containsi: $search } } }
        ]
        and: [
          { price: { gte: $min, lte: $max } }
          { time: { lte: $time } }
          { freelancer: { id: { notNull: true } } }
          { status: { type: { eq: "Active" } } }
          {
            or: [
              { category: { slug: { eq: $cat } } }
              { subcategory: { slug: { eq: $cat } } }
              { subdivision: { slug: { eq: $cat } } }
              { tags: { slug: { in: $tags } } }
            ]
          }
          { freelancer: { verified: { eq: $verified } } }
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

const SERVICES_BY_CATEGORY = gql`
  query ServicesByCategory($category: String!, $subcategory: String) {
    services(
      filters: {
        category: { slug: { eq: $category } }
        subcategory: { slug: { eq: $subcategory } }
        status: { type: { eq: "Active" } }
      }
      pagination: { page: 1, pageSize: 4 }
    ) {
      data {
        id
        attributes {
          ...ServicePartialMain
          ...ServicePartialRelations
        }
      }
    }
  }
  ${SERVICE_PARTIAL_MAIN}
  ${SERVICE_PARTIAL_RELATIONS}
`;

const SERVICES_ALL = gql`
  query ServicesAll {
    allServices: services(pagination: { page: 1, pageSize: 1000 }) {
      data {
        attributes {
          slug
        }
      }
    }
  }
`;

const SERVICES_BY_FREELANCER = gql`
  query ServicesByFreelancer($id: ID!, $page: Int, $pageSize: Int) {
    services(
      filters: {
        freelancer: { id: { eq: $id } }
        or: [
          { status: { type: { eq: "Active" } } }
          { status: { type: { eq: "Pending" } } }
        ]
      }
      sort: "updatedAt:desc"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          title
          slug
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
          status {
            data {
              attributes {
                type
              }
            }
          }
          media {
            ...MultipleFiles
          }
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${CATEGORY}
  ${SUBCATEGORY_ENTITY}
  ${SUBDIVISION_ENTITY}
  ${MULTIPLE_FILES}
  ${PAGINATION}
`;

export {
  SERVICE_BY_ID,
  SERVICE_BY_SLUG,
  SERVICE_PAGE_SEO,
  COUNT_SERVICES_BY_RATING,
  FEATURED_SERVICES_BY_FREELANCER,
  SERVICE_UID,
  FEATURED_SERVICES,
  SERVICES_ARCHIVE,
  SERVICES_BY_CATEGORY,
  SERVICES_ALL,
  SERVICES_BY_FREELANCER,
};
