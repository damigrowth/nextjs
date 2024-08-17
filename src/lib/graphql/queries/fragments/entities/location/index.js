import { gql } from "@apollo/client";

const AREA = gql`
  fragment Area on AreaEntityResponse {
    data {
      id
      attributes {
        name
      }
    }
  }
`;

export { AREA };
