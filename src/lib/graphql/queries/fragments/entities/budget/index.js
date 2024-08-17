import { gql } from "@apollo/client";

const MIN_BUDGETS = gql`
  fragment MinBudgets on BudgetRelationResponseCollection {
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

export { MIN_BUDGETS };
