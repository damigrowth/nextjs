import { gql } from "@apollo/client";
import { SINGLE_IMAGE } from "../../global";

const CATEGORY = gql`
  fragment Category on CategoryEntity {
    id
    attributes {
      label
      slug
    }
  }
`;

const CATEGORY_ENTITY = gql`
  fragment CategoryEntity on CategoryEntityResponseCollection {
    data {
      attributes {
        label
        slug
      }
    }
  }
`;

const SUBCATEGORY_ENTITY = gql`
  fragment SubcategoryEntity on SubcategoryEntity {
    attributes {
      label
      slug
    }
  }
`;

const SUBCATEGORY = gql`
  fragment Subcategory on SubcategoryEntity {
    id
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
  ${CATEGORY}
`;

const CATEGORY_FULL = gql`
  fragment CategoryFull on CategoryEntity {
    id
    attributes {
      label
      slug
      description
      icon
      image {
        ...SingleImage
      }
      subcategories {
        data {
          ...Subcategory
        }
      }
    }
  }
  ${SINGLE_IMAGE}
  ${SUBCATEGORY}
`;

export {
  CATEGORY,
  CATEGORY_ENTITY,
  SUBCATEGORY_ENTITY,
  SUBCATEGORY,
  CATEGORY_FULL,
};
