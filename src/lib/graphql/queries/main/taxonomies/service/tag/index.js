import { TAG } from "@/lib/graphql/queries/fragments/entities/tag";
import { PAGINATION } from "@/lib/graphql/queries/fragments/global";
import { gql } from "@apollo/client";

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

export { TAGS_SEARCH, TAGS_SEARCH_SIMPLE };
