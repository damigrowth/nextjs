import { gql } from "@apollo/client";
import { SINGLE_IMAGE } from "../../fragments/global";
import { ROLE, VERIFICATION } from "../../fragments/entities/user";
import { REVIEW_DISLIKES, REVIEW_LIKES } from "../../fragments/entities/review";
import { REVIEW } from "../review";
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
    image {
      ...SingleImage
    }
    freelancer {
      data {
        id
      }
    }
    verification {
      ...Verification
    }
  }
  ${SINGLE_IMAGE}
  ${VERIFICATION}
`;

const USER_RELATIONS = gql`
  fragment UserRelations on UsersPermissionsUser {
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
  ${ROLE}
  ${REVIEW_LIKES}
  ${REVIEW_DISLIKES}
  ${REVIEW}
  ${ORDERS}
`;

export { USER_MAIN, USER_RELATIONS };
