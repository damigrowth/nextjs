import { gql } from "@apollo/client";

const MIN_BUDGETS_ENTITY = gql`
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

export { MIN_BUDGETS_ENTITY };
