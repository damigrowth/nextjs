import { gql } from "@apollo/client";
import { SINGLE_IMAGE } from "../../global";

const ROLE = gql`
  fragment Role on UsersPermissionsRoleEntityResponse {
    data {
      id
      attributes {
        type
        name
      }
    }
  }
`;

const VERIFICATION = gql`
  fragment Verification on VerificationEntityResponse {
    data {
      id
      attributes {
        status {
          data {
            id
            attributes {
              type
            }
          }
        }
      }
    }
  }
`;

const USER_REFERENCE = gql`
  fragment UserReference on UsersPermissionsUserEntityResponse {
    data {
      id
      attributes {
        firstName
        lastName
        displayName
        username
        image {
          ...SingleImage
        }
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const USER_PARTIAL = gql`
  fragment UserPartial on UsersPermissionsUserEntityResponse {
    data {
      id
      attributes {
        firstName
        lastName
        displayName
        email
        phone
        confirmed
        verified
        image {
          ...SingleImage
        }
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const LIKES = gql`
  fragment Likes on UsersPermissionsUserRelationResponseCollection {
    data {
      id
    }
  }
`;

const DISLIKES = gql`
  fragment Dislikes on UsersPermissionsUserRelationResponseCollection {
    data {
      id
    }
  }
`;

export { ROLE, VERIFICATION, USER_REFERENCE, USER_PARTIAL, LIKES, DISLIKES };
