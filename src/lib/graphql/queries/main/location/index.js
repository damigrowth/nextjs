import { gql } from "@apollo/client";

const COUNTIES_SEARCH = gql`
  query CountiesSearch($name: String) {
    counties(filters: { name: { containsi: $name } }, sort: "name:asc") {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

export { COUNTIES_SEARCH };
