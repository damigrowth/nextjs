import { gql } from "@apollo/client";
import { TAG } from "../../fragments/entities/tag";

const TAGS = gql`
  query GetTags {
    tags(sort: "label:desc") {
      data {
        ...Tag
      }
    }
  }
  ${TAG}
`;

export { TAGS };
