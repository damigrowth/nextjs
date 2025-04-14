import { gql } from "@apollo/client";
import { PAGINATION, SINGLE_IMAGE } from "../../../fragments/global";

const SERVICE_TAXONOMIES = gql`
  query ServiceTaxonomies {
    categories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
    subcategories(sort: "label:asc") {
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
    subdivisions(sort: "label:asc") {
      data {
        attributes {
          label
          slug
          subcategory {
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

const CATEGORIES = gql`
  query Categories {
    categories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const SUBCATEGORIES = gql`
  query Subcategories {
    subcategories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const TAXONOMIES_BY_SLUG = gql`
  query TaxonomiesBySlug($subcategory: String, $subdivision: String) {
    subcategoryBySlug: subcategories(
      filters: { slug: { eq: $subcategory } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          description
          image {
            ...SingleImage
          }
          category {
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
    subdivisionBySlug: subdivisions(
      filters: { slug: { eq: $subdivision } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          description
          image {
            ...SingleImage
          }
          category {
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
  ${SINGLE_IMAGE}
`;

const SERVICES_ARCHIVE_SEO = gql`
  query ServicesArchiveSeo(
    $category: String
    $subcategory: String
    $subdivision: String
  ) {
    category: categories(
      filters: { slug: { eq: $category } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          description
          image {
            ...SingleImage
          }
        }
      }
    }
    subcategory: subcategories(
      filters: { slug: { eq: $subcategory } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          description
          image {
            ...SingleImage
          }
        }
      }
    }
    subdivision: subdivisions(
      filters: { slug: { eq: $subdivision } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
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

const TAXONOMIES_ARCHIVE = gql`
  query TaxonomiesArchive($category: String!) {
    archive: topServiceTaxonomiesByCategory(category: $category, limit: 10) {
      category {
        label
        slug
        description
        image {
          ...SingleImage
        }
      }
      subcategories {
        label
        slug
        image {
          ...SingleImage
        }
        category {
          data {
            attributes {
              slug
            }
          }
        }
        subdivisions {
          data {
            attributes {
              label
              slug
            }
          }
        }
      }
      subdivisions {
        label
        slug
        category {
          data {
            attributes {
              slug
            }
          }
        }
        subcategory {
          data {
            attributes {
              slug
            }
          }
        }
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const TAXONOMIES_ARCHIVE_FILTERED = gql`
  query TaxonomiesArchiveFiltered($category: String!) {
    archive: topServiceTaxonomiesByCategory(category: $category, limit: 10) {
      category {
        label
        slug
        description
        image {
          ...SingleImage
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
        label
        slug
        image {
          ...SingleImage
        }
        category {
          data {
            attributes {
              slug
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
            attributes {
              label
              slug
            }
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
        label
        slug
        category {
          data {
            attributes {
              slug
            }
          }
        }
        subcategory {
          data {
            attributes {
              slug
            }
          }
        }
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES = gql`
  query TaxonomiesArchiveWithActiveServices($category: String!) {
    category: categories(
      filters: { slug: { eq: $category } }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          description
          image {
            ...SingleImage
          }
        }
      }
    }
    subcategories: subcategories(
      filters: {
        and: [
          { 
            category: { 
              slug: { 
                eq: $category 
              } 
            } 
          },
          {
            services: {
              id: { ne: null }
              status: { type: { eq: "Active" } }
              freelancer: { id: { ne: null } }
            }
          }
        ]
      }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          image {
            ...SingleImage
          }
          category {
            data {
              attributes {
                slug
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
              attributes {
                label
                slug
              }
            }
          }
        }
      }
    }
    subdivisions: subdivisions(
      filters: {
        and: [
          { 
            category: { 
              slug: { 
                eq: $category 
              } 
            } 
          },
          {
            services: {
              id: { ne: null }
              status: { type: { eq: "Active" } }
              freelancer: { id: { ne: null } }
            }
          }
        ]
      }
      sort: "label:asc"
      pagination: { limit: 10 }
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
          subcategory {
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
  ${SINGLE_IMAGE}
`;

const ALL_TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES = gql`
  query AllTaxonomiesArchiveWithActiveServices {
    categories: categories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
          description
          image {
            ...SingleImage
          }
        }
      }
    }
    subcategories: subcategories(
      filters: {
        services: {
          id: { ne: null }
          status: { type: { eq: "Active" } }
          freelancer: { id: { ne: null } }
        }
      }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          image {
            ...SingleImage
          }
          category {
            data {
              attributes {
                slug
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
              attributes {
                label
                slug
              }
            }
          }
        }
      }
    }
    subdivisions: subdivisions(
      filters: {
        services: {
          id: { ne: null }
          status: { type: { eq: "Active" } }
          freelancer: { id: { ne: null } }
        }
      }
      sort: "label:asc"
      pagination: { limit: 10 }
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
          subcategory {
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
  ${SINGLE_IMAGE}
`;

const HOME_SEARCH = gql`
  query HomeSearch($searchTerm: String, $categorySlug: String) {
    subcategories(
      filters: {
        and: [
          { label_normalized: { containsi: $searchTerm } }
          { category: { slug: { eq: $categorySlug } } }
          { services: { id: { not: { null: true } } } }
        ]
      }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
        }
      }
    }
    subdivisions(
      filters: {
        and: [
          { label_normalized: { containsi: $searchTerm } }
          { category: { slug: { eq: $categorySlug } } }
          { services: { id: { not: { null: true } } } }
        ]
      }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
          subcategory {
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

const TAXONOMIES_SEARCH = gql`
  query TaxonomiesSearch(
    $categoryId: ID
    $subcategoryId: ID
    $categoryTerm: String
    $subcategoryTerm: String
    $subdivisionTerm: String
  ) {
    categories(
      filters: { label: { containsi: $categoryTerm } }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
        }
      }
    }
    subcategories(
      filters: {
        category: { id: { eq: $categoryId } }
        label: { containsi: $subcategoryTerm }
      }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
        }
      }
    }
    subdivisions(
      filters: {
        subcategory: { id: { eq: $subcategoryId } }
        label: { containsi: $subdivisionTerm }
      }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
        }
      }
    }
  }
`;

const CATEGORIES_SEARCH = gql`
  query CategoriesSearch(
    $categoryTerm: String
    $categoriesPage: Int
    $categoriesPageSize: Int
  ) {
    categories(
      filters: { label: { containsi: $categoryTerm } }
      pagination: { page: $categoriesPage, pageSize: $categoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

const SUBCATEGORIES_SEARCH = gql`
  query SubcategoriesSearch(
    $categoryId: ID
    $subcategoryTerm: String
    $subcategoriesPage: Int
    $subcategoriesPageSize: Int
  ) {
    subcategories(
      filters: {
        category: { id: { eq: $categoryId } }
        label: { containsi: $subcategoryTerm }
      }
      pagination: { page: $subcategoriesPage, pageSize: $subcategoriesPageSize }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

const SUBDIVISIONS_SEARCH = gql`
  query SubdivisionsSearch(
    $subcategoryId: ID
    $subdivisionTerm: String
    $subdivisionsPage: Int
    $subdivisionsPageSize: Int
  ) {
    subdivisions(
      filters: {
        subcategory: { id: { eq: $subcategoryId } }
        label: { containsi: $subdivisionTerm }
      }
      pagination: { page: $subdivisionsPage, pageSize: $subdivisionsPageSize }
      sort: "label:asc"
    ) {
      data {
        id
        attributes {
          label
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

const SUBCATEGORIES_SEARCH_FILTERED = gql`
  query SubcategoriesSearchFiltered(
    $searchTerm: String
    $subcategoryPage: Int
    $subcategoryPageSize: Int
  ) {
    subcategoriesSearch: subcategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { services: { id: { not: { null: true } } } }
        ]
      }
      pagination: { page: $subcategoryPage, pageSize: $subcategoryPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
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

const SUBDIVISIONS_SEARCH_FILTERED = gql`
  query SubdivisionsSearchFiltered(
    $searchTerm: String
    $subcategorySlug: String
    $subdivisionPage: Int
    $subdivisionPageSize: Int
  ) {
    subdivisionsSearch: subdivisions(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { subcategory: { slug: { eq: $subcategorySlug } } }
          { services: { id: { not: { null: true } } } }
        ]
      }
      pagination: { page: $subdivisionPage, pageSize: $subdivisionPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
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

const SERVICES_ARCHIVE_ALL = gql`
  query ServicesArchiveAll {
    allServicesArchive: subcategories(
      filters: {
        services: {
          id: { ne: null }
          status: { type: { eq: "Active" } }
          freelancer: { id: { ne: null } }
        }
      }
      pagination: { page: 1, pageSize: 1000 }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
          slug
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

const CATEGORIES_FOR_FILTERED_SERVICES = gql`
  query CategoriesForFilteredServices(
    $search: String
    $min: Int
    $max: Int
    $time: Int
    $tags: [String]
    $verified: Boolean
    $subcategoryPage: Int
    $subcategoryPageSize: Int
  ) {
    subcategoriesForFilteredResults: subcategories(
      filters: {
        and: [
          {
            services: {
              and: [
                {
                  or: [
                    { title_normalized: { containsi: $search } }
                    { description_normalized: { containsi: $search } }
                    { category: { label_normalized: { containsi: $search } } }
                    {
                      subcategory: { label_normalized: { containsi: $search } }
                    }
                    {
                      subdivision: { label_normalized: { containsi: $search } }
                    }
                    { tags: { label_normalized: { containsi: $search } } }
                  ]
                }
                { price: { gte: $min, lte: $max } }
                { time: { lte: $time } }
                { freelancer: { id: { notNull: true } } }
                { status: { type: { eq: "Active" } } }
                { tags: { slug: { in: $tags } } }
                { freelancer: { verified: { eq: $verified } } }
              ]
            }
          }
        ]
      }
      pagination: { page: $subcategoryPage, pageSize: $subcategoryPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
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

const SUBDIVISIONS_FOR_FILTERED_SERVICES = gql`
  query SubdivisionsForFilteredServices(
    $search: String
    $min: Int
    $max: Int
    $time: Int
    $subcategorySlug: String
    $tags: [String]
    $verified: Boolean
    $subdivisionPage: Int
    $subdivisionPageSize: Int
  ) {
    subdivisionsForFilteredResults: subdivisions(
      filters: {
        and: [
          { subcategory: { slug: { eq: $subcategorySlug } } }
          {
            services: {
              and: [
                {
                  or: [
                    { title_normalized: { containsi: $search } }
                    { description_normalized: { containsi: $search } }
                    { category: { label_normalized: { containsi: $search } } }
                    {
                      subcategory: { label_normalized: { containsi: $search } }
                    }
                    {
                      subdivision: { label_normalized: { containsi: $search } }
                    }
                    { tags: { label_normalized: { containsi: $search } } }
                  ]
                }
                { price: { gte: $min, lte: $max } }
                { time: { lte: $time } }
                { freelancer: { id: { notNull: true } } }
                { status: { type: { eq: "Active" } } }
                { tags: { slug: { in: $tags } } }
                { freelancer: { verified: { eq: $verified } } }
              ]
            }
          }
        ]
      }
      pagination: { page: $subdivisionPage, pageSize: $subdivisionPageSize }
      sort: "label:asc"
    ) {
      data {
        attributes {
          label
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
  CATEGORIES,
  SUBCATEGORIES,
  TAXONOMIES_BY_SLUG,
  SERVICES_ARCHIVE_SEO,
  SERVICE_TAXONOMIES,
  TAXONOMIES_ARCHIVE,
  TAXONOMIES_ARCHIVE_FILTERED,
  TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES,
  ALL_TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES,
  HOME_SEARCH,
  TAXONOMIES_SEARCH,
  CATEGORIES_SEARCH,
  SUBCATEGORIES_SEARCH,
  SUBDIVISIONS_SEARCH,
  SUBCATEGORIES_SEARCH_FILTERED,
  SUBDIVISIONS_SEARCH_FILTERED,
  SERVICES_ARCHIVE_ALL,
  CATEGORIES_FOR_FILTERED_SERVICES,
  SUBDIVISIONS_FOR_FILTERED_SERVICES,
};
