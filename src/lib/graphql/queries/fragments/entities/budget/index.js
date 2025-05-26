import { gql } from '@apollo/client';

const MIN_BUDGET_ENTITY = gql`
  fragment MinBudget on BudgetEntityResponse {
    data {
      id
      attributes {
        value
        label
        slug
      }
    }
  }
`;

export { MIN_BUDGET_ENTITY };
