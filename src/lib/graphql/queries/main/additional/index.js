import { gql } from '@apollo/client';
import { PAGINATION } from '../../fragments';

export const MIN_BUDGET = gql`
  query MinBudget($name: String, $minBudgetPage: Int, $minBudgetPageSize: Int) {
    budgets(
      filters: { label: { containsi: $name } }
      sort: "value:asc"
      pagination: { page: $minBudgetPage, pageSize: $minBudgetPageSize }
    ) {
      data {
        id
        attributes {
          value
          label
          slug
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;

export const INDUSTRIES = gql`
  query Industries(
    $name: String
    $industriesPage: Int
    $industriesPageSize: Int
  ) {
    industries(
      filters: { label: { containsi: $name } }
      sort: "label:asc"
      pagination: { page: $industriesPage, pageSize: $industriesPageSize }
    ) {
      data {
        id
        attributes {
          label
          slug
        }
      }
      meta {
        ...Pagination
      }
    }
  }
  ${PAGINATION}
`;
