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
  query TagsForFilteredServices(
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
        and: [
          { label: { containsi: $label } }
          {
            or: [
              { services: { title_normalized: { containsi: $search } } }
              { services: { description_normalized: { containsi: $search } } }
              { services: { category: { label_normalized: { containsi: $search } } } }
              { services: { subcategory: { label_normalized: { containsi: $search } } } }
              { services: { subdivision: { label_normalized: { containsi: $search } } } }
              { services: { tags: { label_normalized: { containsi: $search } } } }
            ]
          }
          { services: { price: { gte: $min, lte: $max } } }
          { services: { time: { lte: $time } } }
          { services: { freelancer: { id: { notNull: true } } } }
          { services: { status: { type: { eq: "Active" } } } }
          { services: { freelancer: { verified: { eq: $verified } } } }
        ]
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
        and: [
          { slug: { in: $slugs } }
          { services: { id: { not: { null: true } } } }
        ]
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

const TAGS_FOR_FILTERED_SERVICES_WITH_CATEGORY = gql`
  query TagsForFilteredServicesWithCategory(
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
        and: [
          { label: { containsi: $label } }
          {
            or: [
              { services: { title_normalized: { containsi: $search } } }
              { services: { description_normalized: { containsi: $search } } }
              { services: { category: { label_normalized: { containsi: $search } } } }
              { services: { subcategory: { label_normalized: { containsi: $search } } } }
              { services: { subdivision: { label_normalized: { containsi: $search } } } }
              { services: { tags: { label_normalized: { containsi: $search } } } }
            ]
          }
          { services: { price: { gte: $min, lte: $max } } }
          { services: { time: { lte: $time } } }
          { services: { freelancer: { id: { notNull: true } } } }
          { services: { status: { type: { eq: "Active" } } } }
          { services: { freelancer: { verified: { eq: $verified } } } }
          {
            or: [
              { services: { category: { slug: { eq: $cat } } } }
              { services: { subcategory: { slug: { eq: $cat } } } }
              { services: { subdivision: { slug: { eq: $cat } } } }
            ]
          }
        ]
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
        and: [
          { slug: { in: $slugs } }
          { services: { id: { notNull: true } } }
          {
            or: [
              { services: { category: { slug: { eq: $cat } } } }
              { services: { subcategory: { slug: { eq: $cat } } } }
              { services: { subdivision: { slug: { eq: $cat } } } }
            ]
          }
        ]
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
