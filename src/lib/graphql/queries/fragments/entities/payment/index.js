import { gql } from "@apollo/client";

const PAYMENT_METHOD = gql`
  fragment PaymentMethod on PaymentMethodRelationResponseCollection {
    data {
      id
      attributes {
        label
        slug
      }
    }
  }
`;

export { PAYMENT_METHOD };
