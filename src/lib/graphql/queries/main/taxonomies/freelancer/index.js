import { gql } from "@apollo/client";
import { PAGINATION, SINGLE_IMAGE } from "../../../fragments/global";

// const FREELANCER_CATEGORIES = gql`
//   query GetFreelancerCategories {
//     freelancerCategories(sort: "label:asc") {
//       data {
//         ...FreelancerCategoryFull
//       }
//     }
//   }
//   ${FREELANCER_CATEGORY_FULL}
// `;

const FREELANCER_CATEGORIES = gql`
  query FreelancerCategories {
    categories: freelancerCategories(sort: "label:asc") {
      data {
        attributes {
          label
          plural
          slug
        }
      }
    }
  }
`;

const FREELANCER_CATEGORIES_SEARCH = gql`
  query FreelancerCategoriesSearch($label: String, $type: String) {
    categoriesSearch: freelancerCategories(
      filters: { label: { containsi: $label }, type: { slug: { eq: $type } } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          plural
          slug
        }
      }
    }
  }
`;

const FREELANCER_SUBCATEGORIES = gql`
  query FreelancerSubcategories {
    subcategories: freelancerSubcategories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const FREELANCER_SUBCATEGORIES_SEARCH = gql`
  query FreelancerSubcategoriesSearch(
    $searchTerm: String
    $categorySlug: String
    $type: String
  ) {
    subcategoriesSearch: freelancerSubcategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { category: { slug: { eq: $categorySlug } } }
          { type: { slug: { eq: $type } } }
          { freelancers: { id: { not: { null: true } } } }
        ]
      }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          plural
          slug
        }
      }
    }
  }
`;

const FREELANCER_TAXONOMIES_BY_SLUG = gql`
  query FreelancerTaxonomiesBySlug(
    $category: String
    $subcategory: String
    $type: String
  ) {
    categoryBySlug: freelancerCategories(
      filters: { slug: { eq: $category } }
      sort: "label:asc"
    ) {
      data {
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
    }
    subcategoryBySlug: freelancerSubcategories(
      filters: {
        slug: { eq: $subcategory }
        type: { slug: { eq: $type } }
        freelancers: { id: { not: { null: true } } }
      }
      sort: "label:asc"
    ) {
      data {
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
    }
  }
  ${SINGLE_IMAGE}
`;

const FREELANCERS_ARCHIVE_SEO = gql`
  query FreelancerArchiveSeo(
    $category: String
    $subcategory: String
    $type: String
  ) {
    freelancerCategory: freelancerCategories(
      filters: { slug: { eq: $category } }
      sort: "label:asc"
    ) {
      data {
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
    }
    freelancerSubcategory: freelancerSubcategories(
      filters: { slug: { eq: $subcategory }, type: { slug: { eq: $type } } }
      sort: "label:asc"
    ) {
      data {
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
    }
  }
  ${SINGLE_IMAGE}
`;

const FREELANCER_CATEGORIES_SEARCH_FILTERED = gql`
  query FreelancerCategoriesSearchFiltered(
    $searchTerm: String
    $categoriesPage: Int
    $categoriesPageSize: Int
  ) {
    categoriesSearch: freelancerCategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { freelancers: { id: { not: { null: true } } } }
        ]
      }
      pagination: { page: $categoriesPage, pageSize: $categoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          plural
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

const FREELANCER_SUBCATEGORIES_SEARCH_FILTERED = gql`
  query FreelancerSubcategoriesSearch(
    $type: String
    $searchTerm: String
    $categorySlug: String
    $subcategoriesPage: Int
    $subcategoriesPageSize: Int
  ) {
    subcategoriesSearch: freelancerSubcategories(
      filters: {
        and: [
          { type: { slug: { eq: $type } } }
          { label: { containsi: $searchTerm } }
          { category: { slug: { eq: $categorySlug } } }
          { freelancers: { id: { not: { null: true } } } }
        ]
      }
      pagination: { page: $subcategoriesPage, pageSize: $subcategoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          plural
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

const FREELANCERS_ARCHIVE_ALL = gql`
  query FreelancersArchiveAll($type: String) {
    allFreelancersArchive: freelancerSubcategories(
      filters: {
        and: [
          { type: { slug: { eq: $type } } }
          { freelancers: { id: { not: { null: true } } } }
        ]
      }
      pagination: { page: 1, pageSize: 1000 }
      sort: "label:asc"
    ) {
      data {
        attributes {
          slug
          updatedAt # Added subcategory updatedAt
          category {
            data {
              attributes {
                slug
                updatedAt # Added category updatedAt
              }
            }
          }
        }
      }
    }
  }
`;

const FREELANCER_PROFILE_CATEGORIES = gql`
  query FreelancerProfileCategories(
    $label: String
    $categoriesPage: Int
    $categoriesPageSize: Int
  ) {
    freelancerCategories(
      filters: { label: { containsi: $label } }
      pagination: { page: $categoriesPage, pageSize: $categoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
          plural
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

const FREELANCER_PROFILE_SUBCATEGORIES = gql`
  query FreelancerProfileSubcategories(
    $label: String
    $categorySlug: String
    $type: String
    $subcategoriesPage: Int
    $subcategoriesPageSize: Int
  ) {
    freelancerSubcategories(
      filters: {
        label: { containsi: $label }
        category: { slug: { eq: $categorySlug } }
        type: { slug: { eq: $type } }
      }
      pagination: { page: $subcategoriesPage, pageSize: $subcategoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
          plural
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

const FREELANCER_CATEGORIES_FOR_FILTERED_FREELANCERS = gql`
  query FreelancerCategoriesForFilteredFreelancers(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounty: ID
    $type: String
    $skills: [String]
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $categoriesPage: Int
    $categoriesPageSize: Int
  ) {
    categoriesForFilteredResults: freelancerCategories(
      filters: {
        and: [
          {
            freelancers: {
              and: [
                {
                  type: {
                    and: [{ slug: { eq: $type } }, { slug: { ne: "user" } }]
                  }
                }
                { email: { ne: "" } }
                { username: { ne: "" } }
                { displayName: { ne: "" } }
                { rate: { gte: $min, lte: $max } }
                { status: { id: { eq: 1 } } }
                { payment_methods: { id: { in: $paymentMethods } } }
                { contactTypes: { id: { in: $contactTypes } } }
                {
                  coverage: {
                    online: { eq: $coverageOnline }
                    or: [
                      { county: { id: { eq: $coverageCounty } } }
                      { areas: { county: { id: { eq: $coverageCounty } } } }
                    ]
                  }
                }
                { skills: { slug: { in: $skills } } }
                { yearsOfExperience: { gte: $experience } }
                { topLevel: { eq: $top } }
                { verified: { eq: $verified } }
              ]
            }
          }
        ]
      }
      pagination: { page: $categoriesPage, pageSize: $categoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          plural
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

const FREELANCER_SUBCATEGORIES_FOR_FILTERED_FREELANCERS = gql`
  query FreelancerSubcategoriesForFilteredFreelancers(
    $min: Int
    $max: Int
    $paymentMethods: [ID]
    $contactTypes: [ID]
    $coverageOnline: Boolean
    $coverageCounty: ID
    $type: String
    $categorySlug: String!
    $skills: [String]
    $experience: Int
    $top: Boolean
    $verified: Boolean
    $subcategoriesPage: Int
    $subcategoriesPageSize: Int
  ) {
    subcategoriesForFilteredResults: freelancerSubcategories(
      filters: {
        and: [
          { type: { slug: { eq: $type } } }
          { category: { slug: { eq: $categorySlug } } }
          {
            freelancers: {
              and: [
                {
                  type: {
                    and: [{ slug: { eq: $type } }, { slug: { ne: "user" } }]
                  }
                }
                { email: { ne: "" } }
                { username: { ne: "" } }
                { displayName: { ne: "" } }
                { rate: { gte: $min, lte: $max } }
                { status: { id: { eq: 1 } } }
                { payment_methods: { id: { in: $paymentMethods } } }
                { contactTypes: { id: { in: $contactTypes } } }
                {
                  coverage: {
                    online: { eq: $coverageOnline }
                    or: [
                      { county: { id: { eq: $coverageCounty } } }
                      { areas: { county: { id: { eq: $coverageCounty } } } }
                    ]
                  }
                }
                { category: { slug: { eq: $categorySlug } } }
                { skills: { slug: { in: $skills } } }
                { yearsOfExperience: { gte: $experience } }
                { topLevel: { eq: $top } }
                { verified: { eq: $verified } }
              ]
            }
          }
        ]
      }
      pagination: { page: $subcategoriesPage, pageSize: $subcategoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          plural
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

// Query for Pros Sitemap: Fetches categories and nested subcategories with active freelancers (limit 1000)
const PROS_ALL = gql`
  query ProsAll {
    # Renamed query operation name
    freelancerCategories(
      filters: {
        freelancers: { id: { ne: null }, status: { type: { eq: "Active" } } }
      }
      sort: "label:asc"
      pagination: { limit: 1000 } # Limit categories to 1000
    ) {
      data {
        id
        attributes {
          slug
          updatedAt # Category updatedAt
          subcategories(
            filters: {
              type: { type: { eq: "freelancer" } }
              freelancers: {
                id: { ne: null }
                status: { type: { eq: "Active" } }
              }
            }
            pagination: { limit: 1000 } # Limit subcategories to 1000
          ) {
            data {
              id
              attributes {
                slug
                updatedAt # Subcategory updatedAt
              }
            }
          }
        }
      }
    }
  }
`;

// Query for Companies Sitemap: Fetches categories and nested subcategories with active companies (limit 1000)
const COMPANIES_ALL = gql`
  query CompaniesAll {
    # Renamed query operation name
    freelancerCategories(
      filters: {
        freelancers: { id: { ne: null }, status: { type: { eq: "Active" } } }
      }
      sort: "label:asc"
      pagination: { limit: 1000 } # Limit categories to 1000
    ) {
      data {
        id
        attributes {
          slug
          updatedAt # Category updatedAt
          subcategories(
            filters: {
              type: { type: { eq: "company" } }
              freelancers: {
                id: { ne: null }
                status: { type: { eq: "Active" } }
              }
            }
            pagination: { limit: 1000 } # Limit subcategories to 1000
          ) {
            data {
              id
              attributes {
                slug
                updatedAt # Subcategory updatedAt
              }
            }
          }
        }
      }
    }
  }
`;

export {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SUBCATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH,
  FREELANCER_TAXONOMIES_BY_SLUG,
  FREELANCERS_ARCHIVE_SEO,
  FREELANCER_CATEGORIES_SEARCH_FILTERED,
  FREELANCER_SUBCATEGORIES_SEARCH_FILTERED,
  FREELANCERS_ARCHIVE_ALL,
  FREELANCER_PROFILE_CATEGORIES,
  FREELANCER_PROFILE_SUBCATEGORIES,
  FREELANCER_CATEGORIES_FOR_FILTERED_FREELANCERS,
  FREELANCER_SUBCATEGORIES_FOR_FILTERED_FREELANCERS,
  PROS_ALL,
  COMPANIES_ALL, // Export the new companies query
};
