import { gql } from "@apollo/client";
import { DISLIKES, LIKES, USER_PARTIAL } from "../../fragments/entities/user";
import { SERVICE } from "../../fragments/entities/service";
import { STATUS, TYPE } from "../../fragments/global";

const REVIEW_MAIN = gql`
  fragment ReviewMain on Review {
    rating
    comment
    createdAt
    updatedAt
    publishedAt
  }
`;

const REVIEW_RELATIONS = gql`
  fragment ReviewRelations on Review {
    user {
      ...UserPartial
    }
    service {
      ...Service
    }
    type {
      ...Type
    }
    status {
      ...Status
    }
    likes {
      ...Likes
    }
    dislikes {
      ...Dislikes
    }
  }
  ${USER_PARTIAL}
  ${SERVICE}
  ${TYPE}
  ${STATUS}
  ${LIKES}
  ${DISLIKES}
`;

const REVIEW = gql`
  fragment Review on ReviewRelationResponseCollection {
    data {
      id
      attributes {
        ...ReviewMain
        ...ReviewRelations
      }
    }
  }
  ${REVIEW_MAIN}
  ${REVIEW_RELATIONS}
`;

export { REVIEW_MAIN, REVIEW_RELATIONS, REVIEW };
