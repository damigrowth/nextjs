import { gql } from "@apollo/client";
import {
  FEATURED_SERVICE,
  FEATURED_SERVICE_MAIN,
  FEATURED_SERVICE_RELATIONS,
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_SEO,
  REVIEW,
  REVIEW_MAIN,
  REVIEW_RELATIONS,
  SERVICE_MAIN,
  SERVICE_PARTIAL_MAIN,
  SERVICE_PARTIAL_RELATIONS,
  SERVICE_RELATIONS,
  SERVICE_SEO,
  USER_MAIN,
  USER_RELATIONS,
} from "./parts";
import {
  CATEGORY,
  CATEGORY_ENTITY,
  CATEGORY_FULL,
  FREELANCER_CATEGORY_ENTITY,
  FREELANCER_CATEGORY_FULL,
  FREELANCER_REFERENCE,
  PAGINATION,
  SKILL_ENTITY,
  SKILLS,
  SUBCATEGORY,
  TAG,
  TAG_ENTITY,
} from "./fragments";

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

const RATINGS = gql`
  query GetRatings {
    ratings(sort: "id:desc") {
      data {
        id
        attributes {
          label
          grade
          slug
        }
      }
    }
  }
`;

const TAGS = gql`
  query GetTags {
    tags(sort: "label:desc") {
      data {
        ...Tag
      }
    }
  }
  ${TAG}
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

// TODO: CREATE ALL THE FIELDS FOR USER IN THE BACKEND
const GET_ME = gql`
  query GetME {
    me {
      id
      email
    }
  }
`;

const USER_BY_ID_BASIC = gql`
  query getUserBasic($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          ...UserMain
        }
      }
    }
  }
  ${USER_MAIN}
`;

const USER_BY_ID = gql`
  query getUser($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          ...UserMain
          ...UserRelations
        }
      }
    }
  }
  ${USER_MAIN}
  ${USER_RELATIONS}
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

const REVIEWS_BY_FREELANCER = gql`
  query reviewsByFreelancer($id: ID!, $page: Int, $pageSize: Int) {
    reviews(
      sort: "publishedAt:desc"
      filters: { freelancer: { id: { eq: $id } } }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          ...ReviewMain
          ...ReviewRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${REVIEW_MAIN}
  ${REVIEW_RELATIONS}
  ${PAGINATION}
`;

const ALL_REVIEWS_RATINGS_BY_FREELANCER = gql`
  query allReviewsRatingsByFreelancer($id: ID!, $pageSize: Int) {
    reviews(
      filters: { freelancer: { id: { eq: $id } } }
      pagination: { pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          rating
        }
      }
    }
  }
`;

const REVIEWS_BY_SERVICE = gql`
  query reviewsByService($id: ID!, $page: Int, $pageSize: Int) {
    reviews(
      sort: "publishedAt:desc"
      filters: { service: { id: { eq: $id } } }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          ...ReviewMain
          ...ReviewRelations
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${REVIEW_MAIN}
  ${REVIEW_RELATIONS}
  ${PAGINATION}
`;

const ALL_REVIEWS_RATINGS_BY_SERVICE = gql`
  query allReviewsRatingsByService($id: ID!, $pageSize: Int) {
    reviews(
      filters: { service: { id: { eq: $id } } }
      pagination: { pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          rating
        }
      }
    }
  }
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

const FREELANCERS_ARCHIVE = gql`
  query FreelancersArchive(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounties: [ID]
    $type: ID
    $cat: String
    $specializations: [ID]
    $experience: Int
    $top: Boolean
    $sort: [String]
    $page: Int
  ) {
    freelancers(
      filters: {
        rate: { gte: $min, lte: $max }
        payment_methods: { id: { in: $paymentMethods } }
        contactTypes: { id: { in: $contactTypes } }
        coverage: {
          online: { eq: $coverageOnline }
          counties: { id: { in: $coverageCounties } }
        }
        type: { id: { eq: $type } }
        category: { slug: { eq: $cat } }
        specialisations: { id: { in: $specializations } }
        yearsOfExperience: { gte: $experience }
        topLevel: { eq: $top }
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

const PAYMENT_METHODS = gql`
  query PaymentMethods {
    paymentMethods {
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

const CONTACT_TYPES = gql`
  query ContactTypes {
    contactTypes {
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

const FREELANCER_CATEGORIES_SEARCH = gql`
  query FreelancerCategoriesSearch($label: String) {
    freelancerCategories(
      filters: { label: { containsi: $label } }
      sort: "label:desc"
    ) {
      data {
        ...FreelancerCategoryFull
      }
    }
  }
  ${FREELANCER_CATEGORY_FULL}
`;

const SPECIALIZATIONS = gql`
  query Specializations {
    skills {
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

const COUNTIES_SEARCH = gql`
  query CountiesSearch($name: String) {
    counties(filters: { name: { containsi: $name } }, sort: "name:asc") {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const HEADER = gql`
  query Header {
    header {
      data {
        attributes {
          categories {
            data {
              attributes {
                label
                slug
              }
            }
          }
        }
      }
    }
  }
`;

const FOOTER = gql`
  query Footer {
    footer {
      data {
        attributes {
          company {
            data {
              attributes {
                title
                slug
              }
            }
          }
          categories {
            data {
              attributes {
                label
                slug
              }
            }
          }
        }
      }
    }
  }
`;

const FEATURED_CATEGORIES = gql`
  query FeaturedCategories {
    featuredEntity {
      data {
        attributes {
          categories {
            data {
              ...CategoryFull
            }
          }
        }
      }
    }
  }
  ${CATEGORY_FULL}
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

const ALL_TAXONOMIES = gql`
  query AllTaxonomies {
    freelancerCategories {
      ...FreelancerCategoryEntity
    }
    skills {
      ...SkillEntity
    }
    tags {
      ...TagEntity
    }
    categories {
      ...CategoryEntity
    }
  }
  ${FREELANCER_CATEGORY_ENTITY}
  ${TAG_ENTITY}
  ${SKILL_ENTITY}
  ${CATEGORY_ENTITY}
`;

const CATEGORIES = gql`
  query GetCategories {
    categories(sort: "label:desc") {
      data {
        ...CategoryFull
      }
    }
  }
  ${CATEGORY_FULL}
`;

const CATEGORIES_SEARCH = gql`
  query CategoriesSearch($label: String) {
    categories(filters: { label: { containsi: $label } }, sort: "label:desc") {
      data {
        ...CategoryFull
      }
    }
  }
  ${CATEGORY_FULL}
`;

const SUBCATEGORIES_SEARCH = gql`
  query SubcategoriesSearch($term: String) {
    subcategories(filters: { label: { containsi: $term } }) {
      data {
        attributes {
          label
          slug
          category {
            data {
              ...Category
            }
          }
        }
      }
    }
  }
  ${CATEGORY}
`;

const CATEGORY_SUBCATEGORIES_SEARCH = gql`
  query CategorySubcategoriesSearch(
    $searchTerm: String
    $categorySlug: String
  ) {
    subcategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { category: { slug: { eq: $categorySlug } } }
        ]
      }
    ) {
      data {
        ...Subcategory
      }
    }
  }
  ${SUBCATEGORY}
`;

export {
  GET_ME,
  USER_BY_ID,
  USER_BY_ID_BASIC,
  SERVICE_BY_SLUG,
  SERVICE_SEO_BY_SLUG,
  FREELANCER_BY_USERNAME,
  FREELANCER_SEO_BY_USERNAME,
  RATINGS,
  CATEGORIES,
  TAGS,
  COUNT_SERVICES_BY_RATING,
  COUNT_FREELANCERS_BY_RATING,
  FEATURED_SERVICES_BY_FREELANCER,
  REVIEWS_BY_FREELANCER,
  ALL_REVIEWS_RATINGS_BY_FREELANCER,
  REVIEWS_BY_SERVICE,
  ALL_REVIEWS_RATINGS_BY_SERVICE,
  SERVICE_UID,
  SERVICES_ARCHIVE,
  CATEGORIES_SEARCH,
  FREELANCERS_ARCHIVE,
  PAYMENT_METHODS,
  CONTACT_TYPES,
  FREELANCER_TYPES,
  FREELANCER_CATEGORIES_SEARCH,
  SPECIALIZATIONS,
  COUNTIES_SEARCH,
  HEADER,
  FOOTER,
  FEATURED_CATEGORIES,
  FEATURED_SERVICES,
  FEATURED_FREELANCERS,
  ALL_TAXONOMIES,
  SUBCATEGORIES_SEARCH,
  CATEGORY_SUBCATEGORIES_SEARCH,
};
