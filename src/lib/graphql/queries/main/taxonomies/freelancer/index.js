import { gql } from "@apollo/client";
import {
  FREELANCER_CATEGORY,
  FREELANCER_CATEGORY_FULL,
  FREELANCER_SUBCATEGORY,
} from "../../../fragments/taxonomies/freelancer";
import { SINGLE_IMAGE } from "../../../fragments/global";

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
    freelancerCategories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const FREELANCER_CATEGORIES_SEARCH = gql`
  query FreelancerCategoriesSearch($label: String, $type: String) {
    freelancerCategories(
      filters: { label: { containsi: $label }, type: { slug: { eq: $type } } }
      sort: "label:asc"
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
    freelancerSubcategories(sort: "label:asc") {
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
      filters: {
        label: { containsi: $term }
        type: { slug: { eq: $type } }
        sort: "label:asc"
      }
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

const FREELANCER_TAXONOMIES_BY_SLUG = gql`
  query FreelancerTaxonomiesBySlug(
    $category: String
    $subcategory: String
    $type: String
  ) {
    freelancerCategories(
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
    freelancerSubcategories(
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

export {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SUBCATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH,
  FREELANCER_CATEGORY_SUBCATEGORIES_SEARCH,
  FREELANCER_TAXONOMIES_BY_SLUG,
};
