import { gql } from "@apollo/client";
import { FREELANCER_CATEGORY_FULL } from "../../../fragments/taxonomies/freelancer";

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

export { FREELANCER_CATEGORIES_SEARCH };
