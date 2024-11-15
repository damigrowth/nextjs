import { gql } from "@apollo/client";
import { CATEGORY_FULL } from "../../fragments/taxonomies/service";

const ALL_TAXONOMIES = gql`
  query AllTaxonomies {
    freelancerSubcategories: freelancerSubcategories {
      data {
        attributes {
          plural
          label
          slug
        }
      }
    }
    serviceSubcategories: subcategories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const ALL_TOP_TAXONOMIES = gql`
  query AllTopTaxonomies {
    topFreelancerSubcategories: topFreelancerTaxonomiesByCategory(
      category: ""
    ) {
      subcategories {
        plural
        slug
        type {
          data {
            attributes {
              slug
            }
          }
        }
        category {
          data {
            attributes {
              slug
            }
          }
        }
      }
    }
    topServiceSubcategories: topServiceTaxonomiesByCategory(category: "") {
      subcategories {
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
`;

const FEATURED_CATEGORIES = gql`
  query FeaturedCategories {
    featuredEntity {
      data {
        attributes {
          categories {
            data {
              ...CategoryFull
            }
          }
        }
      }
    }
  }
  ${CATEGORY_FULL}
`;

const CATEGORIES_ALL = gql`
  query CategoriesAll {
    allCategories: categories(sort: "label:asc") {
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
  ALL_TAXONOMIES,
  FEATURED_CATEGORIES,
  CATEGORIES_ALL,
  ALL_TOP_TAXONOMIES,
};
