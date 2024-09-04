import { gql } from "@apollo/client";
import {
  FREELANCER_CATEGORY,
  FREELANCER_CATEGORY_FULL,
  FREELANCER_SUBCATEGORY,
} from "../../../fragments/taxonomies/freelancer";

const FREELANCER_CATEGORIES = gql`
  query GetFreelancerCategories {
    freelancerCategories(sort: "label:desc") {
      data {
        ...FreelancerCategoryFull
      }
    }
  }
  ${FREELANCER_CATEGORY_FULL}
`;

const FREELANCER_CATEGORIES_SEARCH = gql`
  query FreelancerCategoriesSearch($label: String, $type: String) {
    freelancerCategories(
      filters: { label: { containsi: $label }, type: { slug: { eq: $type } } }
      sort: "label:desc"
    ) {
      data {
        ...FreelancerCategoryFull
      }
    }
  }
  ${FREELANCER_CATEGORY_FULL}
`;

const FREELANCER_SUBCATEGORIES = gql`
  query FreelancerSubcategories {
    freelancerSubcategories {
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
  query FreelancerSubcategoriesSearch($term: String, $type: String) {
    freelancerSubcategories(
      filters: { label: { containsi: $term }, type: { slug: { eq: $type } } }
    ) {
      data {
        attributes {
          label
          slug
          category {
            ...FreelancerCategory
          }
        }
      }
    }
  }
  ${FREELANCER_CATEGORY}
`;

const FREELANCER_CATEGORY_SUBCATEGORIES_SEARCH = gql`
  query FreelancerCategorySubcategoriesSearch(
    $searchTerm: String
    $categorySlug: String
    $type: String
  ) {
    freelancerSubcategories(
      filters: {
        and: [
          { label: { containsi: $searchTerm } }
          { category: { slug: { eq: $categorySlug } } }
          { type: { slug: { eq: $type } } }
        ]
      }
    ) {
      data {
        ...FreelancerSubcategory
      }
    }
  }
  ${FREELANCER_SUBCATEGORY}
`;

export {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SUBCATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH,
  FREELANCER_CATEGORY_SUBCATEGORIES_SEARCH,
};
