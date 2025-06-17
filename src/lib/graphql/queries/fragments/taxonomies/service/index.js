import { gql } from '@apollo/client';

import { SINGLE_IMAGE } from '../../global';

const CATEGORY = gql`
  fragment Category on CategoryEntity {
    id
    attributes {
      label
      slug
      icon
    }
  }
`;

const CATEGORY_ENTITY = gql`
  fragment CategoryEntity on CategoryEntityResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

const SUBCATEGORY_ENTITY = gql`
  fragment SubcategoryEntity on SubcategoryEntity {
    id
    attributes {
      label
      slug
    }
  }
`;

const SUBDIVISION_ENTITY = gql`
  fragment SubdivisionEntity on SubdivisionEntity {
    id
    attributes {
      label
      slug
    }
  }
`;

const SUBDIVISION_ENTITY_FULL = gql`
  fragment SubdivisionEntityFull on SubdivisionEntity {
    id
    attributes {
      label
      slug
      image {
        ...SingleImage
      }
    }
  }
  ${SINGLE_IMAGE}
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

const SUBDIVISION = gql`
  fragment Subdivision on SubdivisionEntity {
    id
    attributes {
      label
      slug
      subcategory {
        data {
          ...Subcategory
        }
      }
      category {
        data {
          ...Category
        }
      }
    }
  }
  ${CATEGORY}
  ${SUBCATEGORY}
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
      subdivisions {
        data {
          ...Subdivision
        }
      }
    }
  }
  ${SINGLE_IMAGE}
  ${SUBCATEGORY}
  ${SUBDIVISION}
`;

export {
  CATEGORY,
  CATEGORY_ENTITY,
  CATEGORY_FULL,
  SUBCATEGORY,
  SUBCATEGORY_ENTITY,
  SUBDIVISION,
  SUBDIVISION_ENTITY,
  SUBDIVISION_ENTITY_FULL,
};
