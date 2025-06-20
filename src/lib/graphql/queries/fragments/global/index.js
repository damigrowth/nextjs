import { gql } from '@apollo/client';

const SINGLE_IMAGE = gql`
  fragment SingleImage on UploadFileEntityResponse {
    data {
      id
      attributes {
        name
        formats
        size
        url
        mime
        alternativeText
        caption
        width
        height
        hash
        ext
        previewUrl
        provider
        provider_metadata
      }
    }
  }
`;

const MULTIPLE_FILES = gql`
  fragment MultipleFiles on UploadFileRelationResponseCollection {
    data {
      id
      attributes {
        name
        formats
        size
        url
        mime
        alternativeText
        caption
        width
        height
        hash
        ext
        previewUrl
        provider
        provider_metadata
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

export { MULTIPLE_FILES, PAGINATION, SINGLE_IMAGE, STATUS, TYPE };
