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
    categories: freelancerCategories(sort: "label:asc") {
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

const FREELANCERS_ARCHIVE_SEO = gql`
  query FreelancerTaxonomiesBySlug(
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

export {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SUBCATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH,
  FREELANCER_TAXONOMIES_BY_SLUG,
  FREELANCERS_ARCHIVE_SEO,
};
