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
  query FreelancerProfileCategories(
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
};
