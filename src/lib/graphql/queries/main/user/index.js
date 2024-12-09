import { gql } from "@apollo/client";
import { USER_MAIN, USER_RELATIONS } from "../../parts/user";
import { SINGLE_IMAGE } from "../../fragments/global";
import { ROLE } from "../../fragments/entities/user";
import { REVIEW_DISLIKES, REVIEW_LIKES } from "../../fragments/entities/review";
import { REVIEW } from "../../parts/review";
import { ORDERS } from "../../fragments/entities/order";
import {
  FREELANCER_MAIN,
  FREELANCER_RELATIONS,
  FREELANCER_RELATIONS_WITHOUT_USER,
} from "../../parts/freelancer";

const ME = gql`
  query GetME {
    me {
      id
      role {
        id
        type
      }
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

const USER_PARTIAL = gql`
  query getUser($id: ID) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          username
          email
          firstName
          lastName
          displayName
          image {
            ...SingleImage
          }
        }
      }
    }
  }
  ${SINGLE_IMAGE}
`;

const USER = gql`
  query getUser($id: ID) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
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
              attributes {
                ...FreelancerMain
                ...FreelancerRelationsWithoutUser
              }
            }
          }
          role {
            ...Role
          }
          review_likes {
            ...ReviewLikes
          }
          review_dislikes {
            ...ReviewDislikes
          }
          reviews_given {
            ...Review
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
      }
    }
  }

  ${SINGLE_IMAGE}
  ${FREELANCER_MAIN}
  ${FREELANCER_RELATIONS_WITHOUT_USER}
  ${ROLE}
  ${REVIEW_LIKES}
  ${REVIEW_DISLIKES}
  ${REVIEW}
  ${ORDERS}
`;

export { ME, USER, USER_PARTIAL, USER_BY_ID_BASIC, USER_BY_ID };
