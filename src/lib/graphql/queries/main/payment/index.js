import { gql } from '@apollo/client';

const PAYMENT_METHODS = gql`
  query PaymentMethods {
    paymentMethods {
      data {
        id
        attributes {
          label
          slug
        }
      }
    }
  }
`;

export { PAYMENT_METHODS };
