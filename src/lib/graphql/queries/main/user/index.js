import { gql } from "@apollo/client";
import { USER_MAIN, USER_RELATIONS } from "../../parts/user";

// TODO: CREATE ALL THE FIELDS FOR USER IN THE BACKEND
const GET_ME = gql`
  query GetME {
    me {
      id
      email
    }
  }
`;

const USER_BY_ID_BASIC = gql`
  query getUserBasic($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          ...UserMain
        }
      }
    }
  }
  ${USER_MAIN}
`;

const USER_BY_ID = gql`
  query getUser($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          ...UserMain
          ...UserRelations
        }
      }
    }
  }
  ${USER_MAIN}
  ${USER_RELATIONS}
`;

export { GET_ME, USER_BY_ID_BASIC, USER_BY_ID };
