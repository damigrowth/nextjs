import { PAGINATION, TAG } from '@/lib/graphql/queries/fragments';
import { gql } from '@apollo/client';

// const TAGS = gql`
//   query GetTags {
//     tags(sort: "label:desc") {
//       data {
//         ...Tag
//       }
//     }
//   }
//   ${TAG}
// `;
const TAGS_SEARCH = gql`
  query TagsSearch(
    $label: String
    $tagsPage: Int
    $tagsPageSize: Int
    $slugs: [String!]
  ) {
    tagsBySearch: tags(
      filters: {
        label: { containsi: $label }
        services: { id: { not: { null: true } } }
      }
      pagination: { page: $tagsPage, pageSize: $tagsPageSize }
      sort: "label:asc"
    ) {
      data {
        ...Tag
      }
      meta {
        ...Pagination
      }
    }
    tagsBySlug: tags(
      filters: {
        slug: { in: $slugs }
        services: { id: { not: { null: true } } }
      }
    ) {
      data {
        ...Tag
      }
    }
  }
  ${PAGINATION}
  ${TAG}
`;

const TAGS_SEARCH_SIMPLE = gql`
  query TagsSearchSimple($label: String) {
    tags(filters: { label: { containsi: $label } }, sort: "label:asc") {
      data {
        ...Tag
      }
    }
  }
  ${TAG}
`;

const TAGS_SEARCH_COMPLETE = gql`
  query TagsSearchByCategory(
    $label: String
    $tagsPage: Int
    $tagsPageSize: Int
  ) {
    tags(
      filters: { label: { containsi: $label } }
      pagination: { page: $tagsPage, pageSize: $tagsPageSize }
      sort: "label:asc"
    ) {
      data {
        ...Tag
      }
      meta {
        ...Pagination
      }
    }
  }
  ${TAG}
  ${PAGINATION}
`;

const TAGS_FOR_FILTERED_SERVICES = gql`
  query TagsForFilteredServicesOptimized(
    $search: String
    $min: Int
    $max: Int
    $time: Int
    $verified: Boolean
    $tagsPage: Int
    $tagsPageSize: Int
    $label: String
    $slugs: [String!]
  ) {
    tagsForFilteredResults: tags(
      filters: {
        label: { containsi: $label }
        services: {
          status: { type: { eq: "Active" } }
          freelancer: { id: { notNull: true }, verified: { eq: $verified } }
          price: { gte: $min, lte: $max }
          time: { lte: $time }
          title_normalized: { containsi: $search }
        }
      }
      pagination: { page: $tagsPage, pageSize: $tagsPageSize }
      sort: "label:asc"
    ) {
      data {
        ...Tag
      }
      meta {
        ...Pagination
      }
    }
    tagsBySlug: tags(
      filters: { slug: { in: $slugs }, services: { id: { notNull: true } } }
    ) {
      data {
        ...Tag
      }
    }
  }
  ${PAGINATION}
  ${TAG}
`;

const TAGS_FOR_FILTERED_SERVICES_WITH_CATEGORY = gql`
  query TagsForFilteredServicesWithCategoryOptimized(
    $search: String
    $min: Int
    $max: Int
    $time: Int
    $cat: String!
    $verified: Boolean
    $tagsPage: Int
    $tagsPageSize: Int
    $label: String
    $slugs: [String!]
  ) {
    tagsForFilteredResults: tags(
      filters: {
        label: { containsi: $label }
        services: {
          status: { type: { eq: "Active" } }
          freelancer: { id: { notNull: true }, verified: { eq: $verified } }
          price: { gte: $min, lte: $max }
          time: { lte: $time }
          category: { slug: { eq: $cat } }
          title_normalized: { containsi: $search }
        }
      }
      pagination: { page: $tagsPage, pageSize: $tagsPageSize }
      sort: "label:asc"
    ) {
      data {
        ...Tag
      }
      meta {
        ...Pagination
      }
    }
    tagsBySlug: tags(
      filters: {
        slug: { in: $slugs }
        services: { id: { notNull: true }, category: { slug: { eq: $cat } } }
      }
    ) {
      data {
        ...Tag
      }
    }
  }
  ${PAGINATION}
  ${TAG}
`;

export {
  TAGS_FOR_FILTERED_SERVICES,
  TAGS_FOR_FILTERED_SERVICES_WITH_CATEGORY,
  TAGS_SEARCH,
  TAGS_SEARCH_COMPLETE,
  TAGS_SEARCH_SIMPLE,
};
