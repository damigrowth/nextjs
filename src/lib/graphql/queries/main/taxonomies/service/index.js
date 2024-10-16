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
  query TaxonomiesBySlug(
    $category: String
    $subcategory: String
    $subdivision: String
  ) {
    categoryBySlug: categories(
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

const HOME_SEARCH = gql`
  query HomeSearch($searchTerm: String, $categorySlug: String) {
    homeSearch: subcategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
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

export const CATEGORIES_SEARCH = gql`
  query CategoriesSearch($categoryTerm: String) {
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
  }
`;

export const SUBCATEGORIES_SEARCH = gql`
  query SubcategoriesSearch($categoryId: ID, $subcategoryTerm: String) {
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
  }
`;

export const SUBDIVISIONS_SEARCH = gql`
  query SubdivisionsSearch($subcategoryId: ID, $subdivisionTerm: String) {
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

const SUBCATEGORIES_SEARCH_FILTERED = gql`
  query SubcategoriesSearchFiltered(
    $searchTerm: String
    $categorySlug: String
  ) {
    subcategoriesSearch: subcategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
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
  }
`;
const SUBDIVISIONS_SEARCH_FILTERED = gql`
  query SubdivisionsSearchFiltered(
    $searchTerm: String
    $subcategorySlug: String
  ) {
    subdivisionsSearch: subdivisions(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { subcategory: { slug: { eq: $subcategorySlug } } }
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
  }
`;

export {
  CATEGORIES,
  SUBCATEGORIES,
  TAXONOMIES_BY_SLUG,
  SERVICES_ARCHIVE_SEO,
  SERVICE_TAXONOMIES,
  TAXONOMIES_ARCHIVE,
  HOME_SEARCH,
  TAXONOMIES_SEARCH,
  CATEGORIES_SEARCH,
  SUBCATEGORIES_SEARCH,
  SUBDIVISIONS_SEARCH,
  SUBCATEGORIES_SEARCH_FILTERED,
  SUBDIVISIONS_SEARCH_FILTERED,
};
