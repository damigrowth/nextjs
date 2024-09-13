import { gql } from "@apollo/client";
import {
  CATEGORY,
  CATEGORY_FULL,
  SUBCATEGORY,
} from "../../../fragments/taxonomies/service";

const CATEGORIES = gql`
  query GetCategories {
    categories(sort: "label:asc") {
      data {
        ...CategoryFull
      }
    }
  }
  ${CATEGORY_FULL}
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
    subcategories {
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
  CATEGORIES,
  CATEGORIES_SEARCH,
  SUBCATEGORIES,
  SUBCATEGORIES_SEARCH,
  CATEGORY_SUBCATEGORIES_SEARCH,
};
