import { gql } from '@apollo/client';
import { ORDERS, ROLE, SINGLE_IMAGE } from '../../fragments';

const USER_MAIN = gql`
  fragment UserMain on UsersPermissionsUser {
    username
    email
    phone
    confirmed
    firstName
    lastName
    displayName
    verified
    image {
      ...SingleImage
    }
    freelancer {
      data {
        id
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const USER_RELATIONS = gql`
  fragment UserRelations on UsersPermissionsUser {
    role {
      ...Role
    }
    orders {
      ...Orders
    }
    viewed {
      data {
        id
      }
    }
  }
  ${ROLE}
  ${ORDERS}
`;

export { USER_MAIN, USER_RELATIONS };
