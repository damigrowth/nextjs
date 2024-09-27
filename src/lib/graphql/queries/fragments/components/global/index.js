import { gql } from "@apollo/client";

const VISIBILITY = gql`
  fragment Visibility on ComponentGlobalVisibility {
    phone
    email
    address
  }
`;

export { VISIBILITY };
