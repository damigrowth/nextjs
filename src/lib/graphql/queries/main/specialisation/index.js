import { gql } from "@apollo/client";

const SPECIALIZATIONS = gql`
  query Specializations {
    skills {
      data {
        id
        attributes {
          label
          slug
        }
      }
    }
  }
`;

export { SPECIALIZATIONS };
