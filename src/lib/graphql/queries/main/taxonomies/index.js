import { gql } from "@apollo/client";
import { FREELANCER_CATEGORY_ENTITY } from "../../fragments/taxonomies/freelancer";
import { TAG_ENTITY } from "../../fragments/entities/tag";
import { SKILL_ENTITY } from "../../fragments/entities/skill";
import {
  CATEGORY_ENTITY,
  CATEGORY_FULL,
} from "../../fragments/taxonomies/service";

const ALL_TAXONOMIES = gql`
  query AllTaxonomies {
    freelancerCategories {
      ...FreelancerCategoryEntity
    }
    skills {
      ...SkillEntity
    }
    tags {
      ...TagEntity
    }
    categories {
      ...CategoryEntity
    }
  }
  ${FREELANCER_CATEGORY_ENTITY}
  ${TAG_ENTITY}
  ${SKILL_ENTITY}
  ${CATEGORY_ENTITY}
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

export { ALL_TAXONOMIES, FEATURED_CATEGORIES };
