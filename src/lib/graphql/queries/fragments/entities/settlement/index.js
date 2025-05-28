import { gql } from '@apollo/client';

const SETTLEMENT_METHOD = gql`
  fragment SettlementMethod on SettlementMethodRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { SETTLEMENT_METHOD };
