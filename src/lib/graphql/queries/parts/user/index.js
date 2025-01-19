import { gql } from "@apollo/client";
import { SINGLE_IMAGE } from "../../fragments/global";
import { ROLE } from "../../fragments/entities/user";
import { ORDERS } from "../../fragments/entities/order";

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
