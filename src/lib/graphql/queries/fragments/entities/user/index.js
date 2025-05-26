import { gql } from '@apollo/client';

import { VISIBILITY } from '../../components/global';
import { SINGLE_IMAGE } from '../../global';

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

const VERIFICATION_FRAGMENT = gql`
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

const USER_PARTIAL_FRAGMENT = gql`
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
        image {
          ...SingleImage
        }
        visibility {
          ...Visibility
        }
      }
    }
  }
  ${SINGLE_IMAGE}
  ${VISIBILITY}
`;

export { ROLE, USER_PARTIAL_FRAGMENT, USER_REFERENCE, VERIFICATION_FRAGMENT };
