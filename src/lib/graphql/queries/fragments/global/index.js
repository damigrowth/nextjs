import { gql } from "@apollo/client";

const SINGLE_IMAGE = gql`
  fragment SingleImage on UploadFileEntityResponse {
    data {
      id
      attributes {
        formats
      }
    }
  }
`;

const MULTIPLE_IMAGES = gql`
  fragment MultipleImages on UploadFileRelationResponseCollection {
    data {
      id
      attributes {
        formats
      }
    }
  }
`;

const PAGINATION = gql`
  fragment Pagination on ResponseCollectionMeta {
    pagination {
      page
      pageSize
      pageCount
      total
    }
  }
`;

const TYPE = gql`
  fragment Type on TypeEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

const STATUS = gql`
  fragment Status on StatusEntityResponse {
    data {
      id
      attributes {
        type
      }
    }
  }
`;

export { SINGLE_IMAGE, MULTIPLE_IMAGES, PAGINATION, TYPE, STATUS };
