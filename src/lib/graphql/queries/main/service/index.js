import { gql } from '@apollo/client';
import {
  FEATURED_SERVICE,
  FEATURED_SERVICE_MAIN,
  FEATURED_SERVICE_RELATIONS,
  SERVICE_MAIN,
  SERVICE_PARTIAL_MAIN,
  SERVICE_PARTIAL_RELATIONS,
  SERVICE_RELATIONS,
  SERVICE_SEO,
} from '../../parts';
import {
  CATEGORY,
  MULTIPLE_FILES,
  PAGINATION,
  SUBCATEGORY_ENTITY,
  SUBDIVISION_ENTITY,
} from '../../fragments';

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

const SERVICES_BY_ID = gql`
  query ServiceByIdPublic($id: ID!) {
    services(filters: { id: { eq: $id } }) {
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
    services(filters: { id: { eq: $id } }) {
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
  query FeaturedServices(
    $page: Int = 1
    $pageSize: Int = 4
    $category: String
  ) {
    services(
      filters: {
        status: { type: { eq: "Active" } }
        featured: { eq: true }
        category: { slug: { eq: $category } }
      }
      pagination: { page: $page, pageSize: $pageSize }
      sort: "updatedAt:desc"
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

// Το αρχικό query χωρίς tag φιλτράρισμα
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
        and: [
          {
            or: [
              { title_normalized: { containsi: $search } }
              { description_normalized: { containsi: $search } }
              { category: { label_normalized: { containsi: $search } } }
              { subcategory: { label_normalized: { containsi: $search } } }
              { subdivision: { label_normalized: { containsi: $search } } }
              { tags: { label_normalized: { containsi: $search } } }
            ]
          }
          { price: { gte: $min, lte: $max } }
          { time: { lte: $time } }
          { freelancer: { id: { notNull: true } } }
          { status: { type: { eq: "Active" } } }
          {
            or: [
              { category: { slug: { eq: $cat } } }
              { subcategory: { slug: { eq: $cat } } }
              { subdivision: { slug: { eq: $cat } } }
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

// Νέο query με tag φιλτράρισμα
const SERVICES_ARCHIVE_WITH_TAGS = gql`
  query ServicesArchiveWithTags(
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
        and: [
          {
            or: [
              { title_normalized: { containsi: $search } }
              { description_normalized: { containsi: $search } }
              { category: { label_normalized: { containsi: $search } } }
              { subcategory: { label_normalized: { containsi: $search } } }
              { subdivision: { label_normalized: { containsi: $search } } }
              { tags: { label_normalized: { containsi: $search } } }
            ]
          }
          { price: { gte: $min, lte: $max } }
          { time: { lte: $time } }
          { freelancer: { id: { notNull: true } } }
          { status: { type: { eq: "Active" } } }
          {
            or: [
              { category: { slug: { eq: $cat } } }
              { subcategory: { slug: { eq: $cat } } }
              { subdivision: { slug: { eq: $cat } } }
            ]
          }
          { tags: { slug: { in: $tags } } }
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
    allServices: services(
      filters: {
        id: { ne: null }
        status: { type: { eq: "Active" } }
        freelancer: { id: { ne: null } }
      }
      pagination: { page: 1, pageSize: 1000 }
    ) {
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

const SERVICES_BY_FREELANCER_FOR_REVIEWS = gql`
  query ServicesByFreelancerForReviews(
    $id: ID!
    $title: String
    $page: Int
    $pageSize: Int
  ) {
    services(
      filters: {
        title_normalized: { containsi: $title }
        freelancer: { id: { eq: $id } }
        status: { type: { eq: "Active" } }
      }
      sort: "updatedAt:desc"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          title
          slug
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

const DRAFT_SERVICES = gql`
  query GetDraftServices {
    draftServices {
      count
    }
  }
`;

export {
  COUNT_SERVICES_BY_RATING,
  DRAFT_SERVICES,
  FEATURED_SERVICES,
  FEATURED_SERVICES_BY_FREELANCER,
  SERVICE_BY_ID,
  SERVICE_BY_SLUG,
  SERVICE_PAGE_SEO,
  SERVICE_UID,
  SERVICES_ALL,
  SERVICES_ARCHIVE,
  SERVICES_ARCHIVE_WITH_TAGS,
  SERVICES_BY_CATEGORY,
  SERVICES_BY_FREELANCER,
  SERVICES_BY_FREELANCER_FOR_REVIEWS,
  SERVICES_BY_ID,
};
