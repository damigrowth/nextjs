import { gql } from '@apollo/client';
import { FREELANCER_PARTIAL } from '../freelancer';
import { DISLIKES, LIKES, SERVICE, STATUS, TYPE } from '../../fragments';

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
    receiver {
      ...FreelancerPartial
    }
    author {
      ...FreelancerPartial
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
  ${FREELANCER_PARTIAL}
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

export { REVIEW, REVIEW_MAIN, REVIEW_RELATIONS };
