import { gql } from '@apollo/client';
import { SERVICE_PARTIAL_MAIN, SERVICE_PARTIAL_RELATIONS } from '../../parts';
import {
  FREELANCER_CATEGORY,
  FREELANCER_SUBCATEGORY_PARTIAL,
  PAGINATION,
  SINGLE_IMAGE,
  SPECIALIZATION_ENTITY,
} from '../../fragments';

const GET_PAGE_BY_SLUG = gql`
  query GetPage($slug: String) {
    pages(filters: { slug: { eq: $slug } }) {
      data {
        attributes {
          title
          description
          faq {
            __typename
            ... on ComponentGlobalFaq {
              title
              faq {
                question
                answer
              }
            }
          }
          tabs {
            __typename
            ... on ComponentGlobalTabs {
              title
              content {
                heading
                paragraph
              }
            }
          }
        }
      }
    }
  }
`;

// CRITICAL: Single batched query for home page - reduces API calls from 5 to 1
const HOME_PAGE = gql`
  query HomePageBatch(
    $servicesPage: Int = 1
    $servicesPageSize: Int = 4
    $servicesCategory: String
    $freelancersPage: Int = 1
    $freelancersPageSize: Int = 4
  ) {
    categories(
      filters: {
        services: {
          id: { ne: null }
          status: { type: { eq: "Active" } }
          freelancer: { id: { ne: null } }
        }
        featured: { eq: true }
      }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
          slug
          description
          icon
          image {
            data {
              id
              attributes {
                formats
              }
            }
          }
          subcategories(
            filters: {
              services: {
                id: { ne: null }
                status: { type: { eq: "Active" } }
                freelancer: { id: { ne: null } }
              }
            }
          ) {
            data {
              id
              attributes {
                label
                slug
                category {
                  data {
                    id
                    attributes {
                      label
                      slug
                      icon
                    }
                  }
                }
                subdivisions(
                  filters: {
                    services: {
                      id: { ne: null }
                      status: { type: { eq: "Active" } }
                      freelancer: { id: { ne: null } }
                    }
                  }
                ) {
                  data {
                    id
                    attributes {
                      label
                      slug
                      subcategory {
                        data {
                          id
                          attributes {
                            label
                            slug
                            category {
                              data {
                                id
                                attributes {
                                  label
                                  slug
                                  icon
                                }
                              }
                            }
                          }
                        }
                      }
                      category {
                        data {
                          id
                          attributes {
                            label
                            slug
                            icon
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    services(
      filters: {
        status: { type: { eq: "Active" } }
        featured: { eq: true }
        category: { slug: { eq: $servicesCategory } }
      }
      pagination: { page: $servicesPage, pageSize: $servicesPageSize }
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

    freelancers(
      filters: {
        type: { slug: { ne: "user" } }
        email: { ne: "" }
        username: { ne: "" }
        displayName: { ne: "" }
        status: { id: { eq: 1 } }
        category: { id: { ne: null } }
        subcategory: { id: { ne: null } }
        featured: { eq: true }
      }
      pagination: { page: $freelancersPage, pageSize: $freelancersPageSize }
      sort: "updatedAt:desc"
    ) {
      data {
        id
        attributes {
          username
          firstName
          lastName
          displayName
          rating
          reviews_total
          topLevel
          verified
          image {
            ...SingleImage
          }
          specialization {
            ...SpecializationEntity
          }
          category {
            ...FreelancerCategory
          }
          subcategory {
            ...FreelancerSubcategoryPartial
          }
        }
      }
      meta {
        ...Pagination
      }
    }

    topFreelancerSubcategories: freelancerSubcategories(
      filters: {
        freelancers: { id: { ne: null }, status: { type: { eq: "Active" } } }
      }
      sort: "label:asc"
      pagination: { limit: 100 }
    ) {
      data {
        attributes {
          plural
          label
          slug
          type {
            data {
              attributes {
                slug
              }
            }
          }
          category {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
    topServiceSubcategories: subcategories(
      filters: {
        services: {
          id: { ne: null }
          status: { type: { eq: "Active" } }
          freelancer: { id: { ne: null } }
        }
      }
      sort: "label:asc"
      pagination: { limit: 100 }
    ) {
      data {
        attributes {
          label
          slug
          category {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
  }
  ${SERVICE_PARTIAL_MAIN}
  ${SERVICE_PARTIAL_RELATIONS}
  ${SINGLE_IMAGE}
  ${SPECIALIZATION_ENTITY}
  ${FREELANCER_CATEGORY}
  ${FREELANCER_SUBCATEGORY_PARTIAL}
  ${PAGINATION}
`;

export { GET_PAGE_BY_SLUG, HOME_PAGE };
