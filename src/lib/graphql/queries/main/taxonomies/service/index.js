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
    categories(filters: { label: { containsi: $label } }, sort: "label:asc") {
      data {
        ...CategoryFull
      }
    }
  }
  ${CATEGORY_FULL}
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
  query SubcategoriesSearch($term: String) {
    subcategories(filters: { label: { containsi: $term } }, sort: "label:asc") {
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
      sort: "label:asc"
    ) {
      data {
        ...Subcategory
      }
    }
  }
  ${SUBCATEGORY}
`;

const SUBCATEGORY_SUBDIVISIONS_SEARCH = gql`
  query SubcategorySubdivisionsSearch(
    $searchTerm: String
    $subcategorySlug: String
  ) {
    subdivisions(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { subcategory: { slug: { eq: $subcategorySlug } } }
        ]
      }
      sort: "label:asc"
    ) {
      data {
        ...Subdivision
      }
    }
  }
  ${SUBDIVISION}
`;

const CATEGORY_BY_SLUG = gql`
  query CategoryBySlug($slug: String!) {
    categories(filters: { slug: { eq: $slug } }, sort: "label:asc") {
      data {
        ...CategoryFull
      }
    }
  }
  ${CATEGORY_FULL}
`;

const SUBCATEGORY_BY_SLUG = gql`
  query SubcategoryBySlug($slug: String!) {
    subcategories(filters: { slug: { eq: $slug } }, sort: "label:asc") {
      data {
        ...Subcategory
        attributes {
          category {
            data {
              ...Category
            }
          }
        }
      }
    }
  }
  ${SUBCATEGORY}
  ${CATEGORY}
`;

const SUBDIVISION_BY_SLUG = gql`
  query SubdivisionBySlug($slug: String!) {
    subdivisions(filters: { slug: { eq: $slug } }, sort: "label:asc") {
      data {
        ...Subdivision
        attributes {
          subcategory {
            data {
              ...Subcategory
              attributes {
                category {
                  data {
                    ...Category
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${SUBDIVISION}
  ${SUBCATEGORY}
  ${CATEGORY}
`;

const TAXONOMIES_BY_SLUG = gql`
  query TaxonomiesBySlug(
    $category: String
    $subcategory: String
    $subdivision: String
  ) {
    categories(filters: { slug: { eq: $category } }, sort: "label:asc") {
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
    subcategories(filters: { slug: { eq: $subcategory } }, sort: "label:asc") {
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
    subdivisions(filters: { slug: { eq: $subdivision } }, sort: "label:asc") {
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

export {
  CATEGORIES,
  CATEGORIES_SEARCH,
  TAXONOMIES_BY_SLUG,
  SUBCATEGORIES,
  SUBCATEGORIES_SEARCH,
  CATEGORY_SUBCATEGORIES_SEARCH,
  SUBCATEGORY_SUBDIVISIONS_SEARCH,
  CATEGORY_BY_SLUG,
  SUBCATEGORY_BY_SLUG,
  SUBDIVISION_BY_SLUG,
};
