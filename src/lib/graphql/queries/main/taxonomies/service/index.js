import { gql } from "@apollo/client";
import {
  CATEGORY,
  CATEGORY_FULL,
  SUBCATEGORY,
  SUBDIVISION,
} from "../../../fragments/taxonomies/service";
import { SINGLE_IMAGE } from "../../../fragments/global";

// const CATEGORIES = gql`
//   query GetCategories {
//     categories(sort: "label:asc") {
//       data {
//         ...CategoryFull
//       }
//     }
//   }
//   ${CATEGORY_FULL}
// `;

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

const CATEGORIES_SEARCH = gql`
  query CategoriesSearch($label: String) {
    categoriesSearch: categories(
      filters: { label: { containsi: $label } }
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

const SUBCATEGORIES_SEARCH = gql`
  query SubcategoriesSearch($searchTerm: String, $categorySlug: String) {
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

const SUBDIVISIONS_SEARCH = gql`
  query SubcategorySubdivisionsSearch(
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

export {
  CATEGORIES,
  CATEGORIES_SEARCH,
  SUBCATEGORIES,
  SUBCATEGORIES_SEARCH,
  SUBDIVISIONS_SEARCH,
  TAXONOMIES_BY_SLUG,
  SERVICES_ARCHIVE_SEO,
  TAXONOMIES_ARCHIVE,
};
